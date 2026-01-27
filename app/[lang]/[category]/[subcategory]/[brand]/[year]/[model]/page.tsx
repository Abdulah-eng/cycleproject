import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServer, Bike } from '@/lib/supabase'
import { calculateBikeMetrics, parseGeometryData, generateUrlSlug, formatCategoryForUrl } from '@/lib/utils'
import ScoreCard from '@/components/ScoreCard'
import ScoreSection from '@/components/ScoreSection'
import ScoreSectionWithToggle from '@/components/ScoreSectionWithToggle'
import SpecsTable from '@/components/SpecsTable'
import ImageGallery from '@/components/ImageGallery'
import AddToCompareButton from '@/components/AddToCompareButton'
import BikeCarousel from '@/components/BikeCarousel'
import { getSameBrandBikes, getBikesByYear, getBetterValueBikes } from '@/lib/recommendations'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

interface PageProps {
  params: {
    category: string
    subcategory: string
    brand: string
    year: string
    model: string
  }
}

// Generate static params for ISR
export async function generateStaticParams() {
  const { data: bikes } = await supabaseServer
    .from('bikes')
    .select('category, sub_category, brand, year, model')
    .limit(10) // Generate first 10 pages at build time

  if (!bikes) return []

  return bikes.map((bike) => {
    const categorySlug = formatCategoryForUrl(bike.category)
    const subCategorySlug = bike.sub_category ? generateUrlSlug(bike.sub_category) : 'general'
    const brandSlug = generateUrlSlug(bike.brand)
    const yearSlug = bike.year ? bike.year.toString() : 'unknown'
    const modelSlug = generateUrlSlug(bike.model)

    return {
      category: categorySlug,
      subcategory: subCategorySlug,
      brand: brandSlug,
      year: yearSlug,
      model: modelSlug,
    }
  })
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bike = await getBikeFromParams(params)

  if (!bike) {
    return {
      title: 'Bike Not Found',
    }
  }

  // Use title_seo for the title tag (SEO), fallback to regular title
  const title = bike.title_seo || bike.title || `${bike.brand} ${bike.model} ${bike.year || ''}`
  // Use meta_desc for the meta description tag (SEO)
  const description = bike.meta_desc || bike.bike_desc || `Discover the ${bike.brand} ${bike.model}, a ${bike.category} bike with premium features and performance.`
  const images = bike.images && bike.images.length > 0 ? [bike.images[0]] : []

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}

async function getBikeFromParams(params: PageProps['params']): Promise<Bike | null> {
  // Decode URL parameters - replace hyphens with spaces for matching
  const brand = decodeURIComponent(params.brand).replace(/-/g, ' ').trim()
  const model = decodeURIComponent(params.model).replace(/-/g, ' ').trim()
  const year = params.year !== 'unknown' ? parseInt(params.year) : null

  try {
    // Try to find bike by brand, model, and year using flexible matching
    let query = supabaseServer
      .from('bikes')
      .select('*')
      .ilike('brand', brand)
      .ilike('model', model)

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query.maybeSingle()

    if (data) {
      return data as Bike
    }

    // If not found with exact match, try with partial model name matching
    // Sometimes URLs might be shortened or formatted differently
    const modelWords = model.split(' ').filter(w => w.length > 2)

    if (modelWords.length > 0) {
      let partialQuery = supabaseServer
        .from('bikes')
        .select('*')
        .ilike('brand', brand)

      // Build a query that matches if model contains key words
      const modelPattern = modelWords.join('%')
      partialQuery = partialQuery.ilike('model', `%${modelPattern}%`)

      if (year) {
        partialQuery = partialQuery.eq('year', year)
      }

      const { data: partialData, error: partialError } = await partialQuery
        .limit(1)
        .maybeSingle()

      if (partialData) {
        return partialData as Bike
      }
    }

    // Last resort: try without year if we had year specified
    if (year) {
      const { data: dataWithoutYear } = await supabaseServer
        .from('bikes')
        .select('*')
        .ilike('brand', brand)
        .ilike('model', model)
        .limit(1)
        .maybeSingle()

      if (dataWithoutYear) {
        return dataWithoutYear as Bike
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching bike:', error)
    return null
  }
}

export default async function BikePage({ params }: PageProps) {
  const bike = await getBikeFromParams(params)

  if (!bike) {
    notFound()
  }

  const metrics = calculateBikeMetrics(bike)
  const geometryData = parseGeometryData(bike.geometry_data)

  const comparisonBike = {
    id: bike.id,
    brand: bike.brand,
    model: bike.model,
    year: bike.year,
    image: bike.images?.[0] || null,
    category: bike.category,
    sub_category: bike.sub_category,
    price: bike.price,
    slug: bike.slug
  }

  // Fetch recommendations
  const [
    sameBrandBikes,
    bikes2025,
    bikes2024,
    bikes2023,
    bikes2022,
    betterValueBikes
  ] = await Promise.all([
    getSameBrandBikes(bike),
    getBikesByYear(2025, bike.category),
    getBikesByYear(2024, bike.category),
    getBikesByYear(2023, bike.category),
    getBikesByYear(2022, bike.category),
    getBetterValueBikes(bike)
  ])

  // Prepare Product structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cycleproject.vercel.app'
  const bikeUrl = `${baseUrl}/en/${params.category}/${params.subcategory}/${params.brand}/${params.year}/${params.model}`

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${bikeUrl}#product`,
    name: `${bike.brand} ${bike.model}`,
    brand: {
      '@type': 'Brand',
      name: bike.brand
    },
    description: bike.bike_desc || bike.meta_desc || `${bike.brand} ${bike.model} - ${bike.category} bike`,
    ...(bike.images && bike.images.length > 0 && {
      image: bike.images
    }),
    ...(bike.price && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: bike.price.toString(),
        highPrice: (bike.price * 1.15).toFixed(0), // Estimate 15% price range
        offerCount: 3
      }
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Product Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-10 mb-8 border border-gray-100">
            {/* Header with Title, Description, Score and Image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Left - Title and Description */}
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  {bike.model}
                </h1>
                <p className="text-2xl text-gray-600 mb-4 font-semibold">{bike.brand}</p>
                {bike.sub_category && (
                  <p className="text-lg text-gray-500 mb-6 font-medium">{bike.sub_category}</p>
                )}

                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  {bike.bike_desc || bike.meta_desc || `A high-performance ${bike.category} bike designed for long rides, offering a balance of comfort, efficiency, and value.`}
                </p>

                <div className="mb-8">
                  <AddToCompareButton bike={comparisonBike} variant="full" className="max-w-xs" />
                </div>

                {/* Overall Score */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-baseline">
                      <span className="text-7xl font-bold text-gray-900">
                        {metrics.overallScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-center mt-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-6 h-6 ${i < Math.floor(metrics.overallScore / 2)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Balanced Comfort Performer</p>
                  </div>
                </div>
              </div>

              {/* Right - Bike Image Gallery */}
              <div className="flex items-center justify-center">
                <ImageGallery images={bike.images || []} alt={`${bike.brand} ${bike.model}`} />
              </div>
            </div>

            {/* Score Summary */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Summary</h2>
              <div className="grid grid-cols-4 gap-4">
                <ScoreCard
                  label={metrics.performance.label}
                  score={metrics.performance.score}
                  maxScore={metrics.performance.maxScore}
                  description={metrics.performance.description}
                  variant="primary"
                  metricType="performance"
                  explanation={bike.performance_score_explanation}
                />
                <ScoreCard
                  label={metrics.value.label}
                  score={metrics.value.score}
                  maxScore={metrics.value.maxScore}
                  description={metrics.value.description}
                  metricType="value"
                  explanation={bike.vfm_reason || bike.value_score_explanation}
                />
                <ScoreCard
                  label={metrics.fit.label}
                  score={metrics.fit.score}
                  maxScore={metrics.fit.maxScore}
                  description={metrics.fit.description}
                  metricType="fit"
                  explanation={bike.fit_reason || bike.fit_score_explanation}
                />
                <ScoreCard
                  label={metrics.general.label}
                  score={metrics.general.score}
                  maxScore={metrics.general.maxScore}
                  description={metrics.general.description}
                  metricType="general"
                  explanation={bike.general_score_explanation}
                />
              </div>
            </div>

            {/* Performance Section */}
            <ScoreSection>
              <ScoreSectionWithToggle title="Performance" subtitle="Built for speed and efficiency" gridCols="grid-cols-3">
                <ScoreCard
                  label={metrics.speed.label}
                  score={metrics.speed.score}
                  maxScore={10}
                  description={metrics.speed.description}
                  variant="inline"
                  explanation={bike.speed_reason}
                />
                <ScoreCard
                  label={metrics.climingEfficiency.label}
                  score={metrics.climingEfficiency.score}
                  maxScore={10}
                  description={metrics.climingEfficiency.description}
                  variant="inline"
                  explanation={bike.climb_reason || bike.climbing_efficiency_explanation}
                />
                <ScoreCard
                  label={metrics.aerodynamics.label}
                  score={metrics.aerodynamics.score}
                  maxScore={10}
                  description={metrics.aerodynamics.description}
                  variant="inline"
                  explanation={bike.aero_reason || bike.aerodynamics_explanation}
                />
              </ScoreSectionWithToggle>
            </ScoreSection>

            {/* Fit Score Section */}
            <ScoreSection>
              <ScoreSectionWithToggle title="Fit Score" subtitle="Dialed-in Fit & Comfort" gridCols="grid-cols-4">
                <ScoreCard
                  label={metrics.ridingPosition.label}
                  score={metrics.ridingPosition.score}
                  maxScore={10}
                  description={metrics.ridingPosition.description}
                  variant="inline"
                  explanation={bike.posture_reason || bike.riding_position_explanation}
                />
                <ScoreCard
                  label={metrics.handling.label}
                  score={metrics.handling.score}
                  maxScore={10}
                  description={metrics.handling.description}
                  variant="inline"
                  explanation={bike.responsiveness_reason || bike.handling_explanation}
                />
                <ScoreCard
                  label={metrics.fitFlexibility.label}
                  score={metrics.fitFlexibility.score}
                  maxScore={10}
                  description={metrics.fitFlexibility.description}
                  variant="inline"
                  explanation={bike.fit_reason || bike.fit_flexibility_explanation}
                />
                <ScoreCard
                  label={metrics.rideComfort.label}
                  score={metrics.rideComfort.score}
                  maxScore={10}
                  description={metrics.rideComfort.description}
                  variant="inline"
                  explanation={bike.comfort_reason || bike.ride_comfort_explanation}
                />
              </ScoreSectionWithToggle>
            </ScoreSection>

            {/* Value Section */}
            <ScoreSection>
              <ScoreSectionWithToggle title="Value" gridCols="grid-cols-3">
                <ScoreCard
                  label={metrics.buildQuality.label}
                  score={metrics.buildQuality.score}
                  maxScore={10}
                  description={metrics.buildQuality.description}
                  variant="inline"
                  metricType="value"
                  explanation={bike.build_reason || bike.build_quality_explanation}
                />
                <ScoreCard
                  label={metrics.valueForMoney.label}
                  score={metrics.valueForMoney.score}
                  maxScore={10}
                  description={metrics.valueForMoney.description}
                  variant="inline"
                  metricType="value"
                  explanation={bike.vfm_reason || bike.value_for_money_explanation}
                />
                <ScoreCard
                  label={metrics.surfaceRange.label}
                  score={metrics.surfaceRange.score}
                  maxScore={10}
                  description={metrics.surfaceRange.description}
                  variant="inline"
                  explanation={bike.surface_reason || bike.surface_range_explanation}
                />
              </ScoreSectionWithToggle>
            </ScoreSection>

            {/* Battery Section - Only for E-bikes */}
            {metrics.battery && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5">Battery</h3>
                <div className="grid grid-cols-1 gap-4">
                  <ScoreCard
                    label={metrics.battery.label}
                    score={metrics.battery.score}
                    maxScore={10}
                    description={metrics.battery.description}
                    variant="inline"
                    explanation={bike.battery_reason}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Bike Image Gallery at Top */}
            <div className="bg-white p-4 mb-4">
              <ImageGallery images={bike.images || []} alt={`${bike.brand} ${bike.model}`} />
            </div>

            {/* Product Info */}
            <div className="px-5 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bike.model}
              </h1>
              <p className="text-xl text-gray-600 mb-3 font-semibold">{bike.brand}</p>

              {bike.sub_category && (
                <div className="inline-block bg-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
                  {bike.sub_category}
                </div>
              )}

              {/* Add to Compare - Mobile */}
              <div className="mb-6">
                <AddToCompareButton bike={comparisonBike} variant="full" />
              </div>

              {/* Overall Score - Mobile */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-6xl font-bold text-gray-900">
                  {metrics.overallScore.toFixed(1)}
                </span>
                <div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(metrics.overallScore / 2)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                          }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Balanced Comfort Performer</p>
                </div>
              </div>

              {/* Score Summary Cards - Mobile 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <ScoreCard
                  label={metrics.performance.label}
                  score={metrics.performance.score}
                  maxScore={metrics.performance.maxScore}
                  description={metrics.performance.description}
                  variant="primary"
                  explanation={bike.performance_score_explanation}
                />
                <ScoreCard
                  label={metrics.value.label}
                  score={metrics.value.score}
                  maxScore={metrics.value.maxScore}
                  description={metrics.value.description}
                  explanation={bike.value_score_explanation}
                />
                <ScoreCard
                  label={metrics.fit.label}
                  score={metrics.fit.score}
                  maxScore={metrics.fit.maxScore}
                  description={metrics.fit.description}
                  explanation={bike.fit_score_explanation}
                />
                <ScoreCard
                  label={metrics.general.label}
                  score={metrics.general.score}
                  maxScore={metrics.general.maxScore}
                  description={metrics.general.description}
                  explanation={bike.general_score_explanation}
                />
              </div>

              {/* Performance Section - Mobile */}
              <ScoreSection>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Performance</h3>
                  <div className="space-y-3">
                    <ScoreCard
                      label={metrics.speed.label}
                      score={metrics.speed.score}
                      maxScore={10}
                      description={metrics.speed.description}
                      variant="inline"
                      explanation={bike.speed_reason}
                    />
                    <ScoreCard
                      label={metrics.climingEfficiency.label}
                      score={metrics.climingEfficiency.score}
                      maxScore={10}
                      description={metrics.climingEfficiency.description}
                      variant="inline"
                      explanation={bike.climbing_efficiency_explanation}
                    />
                    <ScoreCard
                      label={metrics.aerodynamics.label}
                      score={metrics.aerodynamics.score}
                      maxScore={10}
                      description={metrics.aerodynamics.description}
                      variant="inline"
                      explanation={bike.aerodynamics_explanation}
                    />
                  </div>
                </div>
              </ScoreSection>

              {/* Fit Score - Mobile */}
              <ScoreSection>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fit Score</h3>
                  <div className="space-y-3">
                    <ScoreCard
                      label={metrics.ridingPosition.label}
                      score={metrics.ridingPosition.score}
                      maxScore={10}
                      description={metrics.ridingPosition.description}
                      variant="inline"
                      explanation={bike.riding_position_explanation}
                    />
                    <ScoreCard
                      label={metrics.handling.label}
                      score={metrics.handling.score}
                      maxScore={10}
                      description={metrics.handling.description}
                      variant="inline"
                      explanation={bike.handling_explanation}
                    />
                    <ScoreCard
                      label={metrics.fitFlexibility.label}
                      score={metrics.fitFlexibility.score}
                      maxScore={10}
                      description={metrics.fitFlexibility.description}
                      variant="inline"
                      explanation={bike.fit_flexibility_explanation}
                    />
                    <ScoreCard
                      label={metrics.rideComfort.label}
                      score={metrics.rideComfort.score}
                      maxScore={10}
                      description={metrics.rideComfort.description}
                      variant="inline"
                      explanation={bike.ride_comfort_explanation}
                    />
                  </div>
                </div>
              </ScoreSection>

              {/* Value Section - Mobile */}
              <ScoreSection>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Value</h3>
                  <div className="space-y-3">
                    <ScoreCard
                      label={metrics.buildQuality.label}
                      score={metrics.buildQuality.score}
                      maxScore={10}
                      description={metrics.buildQuality.description}
                      variant="inline"
                      explanation={bike.build_quality_explanation}
                    />
                    <ScoreCard
                      label={metrics.valueForMoney.label}
                      score={metrics.valueForMoney.score}
                      maxScore={10}
                      description={metrics.valueForMoney.description}
                      variant="inline"
                      explanation={bike.value_for_money_explanation}
                    />
                  </div>
                </div>
              </ScoreSection>

              {/* Battery Section - Mobile - Only for E-bikes */}
              {metrics.battery && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Battery</h3>
                  <div className="space-y-3">
                    <ScoreCard
                      label={metrics.battery.label}
                      score={metrics.battery.score}
                      maxScore={10}
                      description={metrics.battery.description}
                      variant="inline"
                      explanation={bike.battery_reason}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
          <SpecsTable bike={bike} />
        </div>

        {/* Geometry Section */}
        {bike.geometry_data && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Geometry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Measurement</th>
                    {geometryData['Size']?.map((size, idx) => (
                      <th key={idx} className="text-center py-3 px-4 font-semibold text-gray-700">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(geometryData).map(([key, values]) => {
                    if (key === 'Size') return null
                    return (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{key}</td>
                        {values.map((value, idx) => (
                          <td key={idx} className="text-center py-3 px-4 text-gray-600">
                            {value}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Recommendations Carousels */}
        <div className="mt-12 space-y-8">
          <BikeCarousel
            title={`Other bikes from ${bike.brand}`}
            bikes={sameBrandBikes}
          />

          <BikeCarousel title="2025 Models" bikes={bikes2025} />
          <BikeCarousel title="2024 Models" bikes={bikes2024} />
          <BikeCarousel title="2023 Models" bikes={bikes2023} />
          <BikeCarousel title="2022 Models" bikes={bikes2022} />

          <BikeCarousel
            title="More Value for Money Options"
            bikes={betterValueBikes}
          />
        </div>
      </div>
    </main>
  )
}
