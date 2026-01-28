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
import InteractiveScoreSummary from '@/components/InteractiveScoreSummary'

export const revalidate = 3600

interface PageProps {
  params: {
    lang: string
    category: string
    subcategory: string
    brand: string
    year: string
    model: string
  }
}

// Since we need interactivity for 'Show Explanations', we convert the main parts 
// to client components or the whole page if necessary. 
// However, generateMetadata and generateStaticParams must stay in server components.
// I will keep the structure but add 'use client' and move data fetching to a separate server function if needed.
// Actually, I'll create a Client Page component.

// Decode URL parameters - replace hyphens with spaces for matching
async function getBikeFromParams(params: PageProps['params']): Promise<Bike | null> {
  const brand = decodeURIComponent(params.brand).replace(/-/g, ' ').trim()
  const model = decodeURIComponent(params.model).replace(/-/g, ' ').trim()
  const year = params.year !== 'unknown' ? parseInt(params.year) : null

  console.log('[Bike Lookup] Searching for:', { brand, model, year, params })

  try {
    let query = supabaseServer.from('bikes').select('*').ilike('brand', brand).ilike('model', model)
    if (year) query = query.eq('year', year)
    const { data } = await query.maybeSingle()
    if (data) {
      console.log('[Bike Lookup] Found exact match:', data.id, data.brand, data.model)
      return data as Bike
    }

    console.log('[Bike Lookup] No exact match, trying partial match...')
    // Partial matching fallback
    const modelWords = model.split(' ').filter(w => w.length > 2)
    if (modelWords.length > 0) {
      const modelPattern = modelWords.join('%')
      let partialQuery = supabaseServer.from('bikes').select('*').ilike('brand', brand).ilike('model', `%${modelPattern}%`)
      if (year) partialQuery = partialQuery.eq('year', year)
      const { data: partialData } = await partialQuery.limit(1).maybeSingle()
      if (partialData) {
        console.log('[Bike Lookup] Found partial match:', partialData.id, partialData.brand, partialData.model)
        return partialData as Bike
      }
    }

    console.log('[Bike Lookup] No partial match, trying without year...')
    if (year) {
      const { data: dataWithoutYear } = await supabaseServer.from('bikes').select('*').ilike('brand', brand).ilike('model', model).limit(1).maybeSingle()
      if (dataWithoutYear) {
        console.log('[Bike Lookup] Found match without year:', dataWithoutYear.id, dataWithoutYear.brand, dataWithoutYear.model)
        return dataWithoutYear as Bike
      }
    }
    console.log('[Bike Lookup] No bike found for params:', { brand, model, year })
    return null
  } catch (error) {
    console.error('[Bike Lookup] Error fetching bike:', error)
    return null
  }
}

export async function generateStaticParams() {
  const { data: bikes } = await supabaseServer.from('bikes').select('category, sub_category, brand, year, model').limit(10)
  if (!bikes) return []
  return bikes.map((bike) => ({
    category: formatCategoryForUrl(bike.category),
    subcategory: bike.sub_category ? generateUrlSlug(bike.sub_category) : 'general',
    brand: generateUrlSlug(bike.brand),
    year: bike.year ? bike.year.toString() : 'unknown',
    model: generateUrlSlug(bike.model),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bike = await getBikeFromParams(params)
  if (!bike) return { title: 'Bike Not Found' }
  const title = bike.title_seo || bike.title || `${bike.brand} ${bike.model} ${bike.year || ''}`
  const description = bike.meta_desc || bike.bike_desc || `Discover the ${bike.brand} ${bike.model}.`
  return { title, description }
}

export default async function BikePage({ params }: PageProps) {
  const bike = await getBikeFromParams(params)
  if (!bike) notFound()

  const metrics = calculateBikeMetrics(bike)
  const geometryData = parseGeometryData(bike.geometry_data)
  const comparisonBike = { ...bike, image: bike.images?.[0] || null }

  const subCategoryName = bike.sub_category
  const [sameBrandBikes, bikes2025, bikes2024, bikes2023, bikes2022, betterValueBikes] = await Promise.all([
    getSameBrandBikes(bike),
    getBikesByYear(2025, bike.category, subCategoryName),
    getBikesByYear(2024, bike.category, subCategoryName),
    getBikesByYear(2023, bike.category, subCategoryName),
    getBikesByYear(2022, bike.category, subCategoryName),
    getBetterValueBikes(bike)
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cycleproject.vercel.app'
  const bikeUrl = `${baseUrl}/${params.lang}/${params.category}/${params.subcategory}/${params.brand}/${params.year}/${params.model}`

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${bikeUrl}#product`,
            "name": `${bike.brand} ${bike.model}`,
            "brand": { "@type": "Brand", "name": bike.brand },
            "image": bike.images?.[0] || [],
            "description": bike.bike_desc || bike.meta_desc || `${bike.brand} ${bike.model} Details.`,
            ...(bike.price && {
              "offers": { "@type": "AggregateOffer", "priceCurrency": "EUR", "lowPrice": bike.price.toString(), "highPrice": (bike.price * 1.05).toFixed(0), "offerCount": 5 }
            })
          })
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-6 lg:p-10 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{bike.model}</h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-4 font-semibold">{bike.brand}</p>
              {bike.sub_category && <p className="text-lg text-gray-500 mb-6 font-medium">{bike.sub_category}</p>}
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                {bike.bike_desc || bike.meta_desc || `A high-performance ${bike.category} bike.`}
              </p>
              <div className="mb-8"><AddToCompareButton bike={comparisonBike} variant="full" className="max-w-xs" /></div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-7xl font-bold text-gray-900">{metrics.overallScore.toFixed(1)}</span>
                  <div className="flex justify-center mt-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-6 h-6 ${i < Math.floor(metrics.overallScore / 2) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium text-sm">Rating</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center"><ImageGallery images={bike.images || []} alt={`${bike.brand} ${bike.model}`} /></div>
          </div>

          <InteractiveScoreSummary metrics={metrics} bike={bike} />

          <ScoreSection>
            <ScoreSectionWithToggle title="Performance" subtitle="Built for speed and efficiency" gridCols="grid-cols-1 lg:grid-cols-3">
              <ScoreCard label={metrics.speed.label} score={metrics.speed.score} maxScore={10} description={metrics.speed.description} variant="inline" explanation={bike.speed_reason} />
              <ScoreCard label={metrics.climingEfficiency.label} score={metrics.climingEfficiency.score} maxScore={10} description={metrics.climingEfficiency.description} variant="inline" explanation={bike.climb_reason || bike.climbing_efficiency_explanation} />
              <ScoreCard label={metrics.aerodynamics.label} score={metrics.aerodynamics.score} maxScore={10} description={metrics.aerodynamics.description} variant="inline" explanation={bike.aero_reason || bike.aerodynamics_explanation} />
            </ScoreSectionWithToggle>
          </ScoreSection>

          <ScoreSection>
            <ScoreSectionWithToggle title="Fit Score" subtitle="Dialed-in Fit & Comfort" gridCols="grid-cols-1 lg:grid-cols-4">
              <ScoreCard label={metrics.ridingPosition.label} score={metrics.ridingPosition.score} maxScore={10} description={metrics.ridingPosition.description} variant="inline" explanation={bike.posture_reason || bike.riding_position_explanation} />
              <ScoreCard label={metrics.handling.label} score={metrics.handling.score} maxScore={10} description={metrics.handling.description} variant="inline" explanation={bike.responsiveness_reason || bike.handling_explanation} />
              <ScoreCard label={metrics.fitFlexibility.label} score={metrics.fitFlexibility.score} maxScore={10} description={metrics.fitFlexibility.description} variant="inline" explanation={bike.fit_reason || bike.fit_flexibility_explanation} />
              <ScoreCard label={metrics.rideComfort.label} score={metrics.rideComfort.score} maxScore={10} description={metrics.rideComfort.description} variant="inline" explanation={bike.comfort_reason || bike.ride_comfort_explanation} />
            </ScoreSectionWithToggle>
          </ScoreSection>

          <ScoreSection>
            <ScoreSectionWithToggle title="Value" gridCols="grid-cols-1 lg:grid-cols-3">
              <ScoreCard label={metrics.buildQuality.label} score={metrics.buildQuality.score} maxScore={10} description={metrics.buildQuality.description} variant="inline" metricType="value" explanation={bike.build_reason || bike.build_quality_explanation} />
              <ScoreCard label={metrics.valueForMoney.label} score={metrics.valueForMoney.score} maxScore={10} description={metrics.valueForMoney.description} variant="inline" metricType="value" explanation={bike.vfm_reason || bike.value_for_money_explanation} />
              <ScoreCard label={metrics.surfaceRange.label} score={metrics.surfaceRange.score} maxScore={10} description={metrics.surfaceRange.description} variant="inline" explanation={bike.surface_reason || bike.surface_range_explanation} />
            </ScoreSectionWithToggle>
          </ScoreSection>

          {metrics.battery && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Battery</h3>
              <ScoreCard label={metrics.battery.label} score={metrics.battery.score} maxScore={10} description={metrics.battery.description} variant="inline" explanation={bike.battery_reason} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
          <SpecsTable bike={bike} />
        </div>

        {bike.geometry_data && (
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Geometry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 italic">Measurement</th>
                    {geometryData['Size']?.map((size, idx) => (<th key={idx} className="py-3 px-4 font-semibold text-gray-700">{size}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(geometryData).map(([key, values]) => (
                    key !== 'Size' && (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="text-left py-3 px-4 font-medium text-gray-900">{key}</td>
                        {(values as any[]).map((value, idx) => (<td key={idx} className="py-3 px-4 text-gray-600">{value}</td>))}
                      </tr>)
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 space-y-12">
          <BikeCarousel title={`Other bikes from ${bike.brand}`} bikes={sameBrandBikes} />
          <BikeCarousel title="2025 Models" bikes={bikes2025} />
          <BikeCarousel title="2024 Models" bikes={bikes2024} />
          <BikeCarousel title="2023 Models" bikes={bikes2023} />
          <BikeCarousel title="2022 Models" bikes={bikes2022} />
          <BikeCarousel title="More Value for Money Options" bikes={betterValueBikes} />
        </div>
      </div>
    </main>
  )
}
