import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseServer, Bike } from '@/lib/supabase'
import { calculateBikeMetrics, formatPrice, parseGeometryData } from '@/lib/utils'
import ScoreCard from '@/components/ScoreCard'
import SpecsTable from '@/components/SpecsTable'
import ImageGallery from '@/components/ImageGallery'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

// Generate static params for ISR
export async function generateStaticParams() {
  const { data: bikes } = await supabaseServer
    .from('bikes')
    .select('category, slug')
    .limit(1000) // Generate first 1000 pages at build time

  if (!bikes) return []

  return bikes.map((bike) => ({
    category: bike.category.toLowerCase().replace(/\s+/g, ''),
    slug: bike.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: bike } = await supabaseServer
    .from('bikes')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!bike) {
    return {
      title: 'Bike Not Found',
    }
  }

  const title = bike.title || `${bike.brand} ${bike.model} ${bike.year || ''}`
  const description = bike.meta_desc || `Discover the ${bike.brand} ${bike.model}, a ${bike.category} bike with premium features and performance.`
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

async function getBike(slug: string): Promise<Bike | null> {
  const { data, error } = await supabaseServer
    .from('bikes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as Bike
}

export default async function BikePage({ params }: PageProps) {
  const bike = await getBike(params.slug)

  if (!bike) {
    notFound()
  }

  const metrics = calculateBikeMetrics(bike)
  const geometryData = parseGeometryData(bike.geometry_data)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-10 mb-8 border border-gray-100">
            {/* Header with Title, Description, Score and Image */}
            <div className="grid grid-cols-3 gap-8 mb-10">
              {/* Left - Title and Description */}
              <div className="col-span-2">
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  {bike.brand} {bike.model}
                </h1>
                {bike.sub_category && (
                  <p className="text-lg text-gray-600 mb-6 font-medium">{bike.sub_category}</p>
                )}

                <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                  {bike.meta_desc || `A high-performance ${bike.category} bike designed for long rides, offering a balance of comfort, efficiency, and value.`}
                </p>

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
                          className={`w-6 h-6 ${
                            i < Math.floor(metrics.overallScore / 2)
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

              {/* Right - Bike Image */}
              <div className="flex items-center justify-center">
                {bike.images && bike.images.length > 0 ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={bike.images[0]}
                      alt={`${bike.brand} ${bike.model}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
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
                />
                <ScoreCard
                  label={metrics.value.label}
                  score={metrics.value.score}
                  maxScore={metrics.value.maxScore}
                  description={metrics.value.description}
                />
                <ScoreCard
                  label={metrics.fit.label}
                  score={metrics.fit.score}
                  maxScore={metrics.fit.maxScore}
                  description={metrics.fit.description}
                />
                <ScoreCard
                  label={metrics.general.label}
                  score={metrics.general.score}
                  maxScore={metrics.general.maxScore}
                  description={metrics.general.description}
                />
              </div>
            </div>

            {/* Performance Section */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance</h3>
              <p className="text-sm text-gray-600 mb-5">Built for speed and efficiency</p>
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard
                  label={metrics.climingEfficiency.label}
                  score={metrics.climingEfficiency.score}
                  maxScore={10}
                  description={metrics.climingEfficiency.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.aerodynamics.label}
                  score={metrics.aerodynamics.score}
                  maxScore={10}
                  description={metrics.aerodynamics.description}
                  variant="inline"
                />
              </div>
            </div>

            {/* Fit Score Section */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fit Score</h3>
              <p className="text-sm text-gray-600 mb-5">Dialed-in Fit & Comfort</p>
              <div className="grid grid-cols-4 gap-4">
                <ScoreCard
                  label={metrics.ridingPosition.label}
                  score={metrics.ridingPosition.score}
                  maxScore={10}
                  description={metrics.ridingPosition.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.handling.label}
                  score={metrics.handling.score}
                  maxScore={10}
                  description={metrics.handling.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.fitFlexibility.label}
                  score={metrics.fitFlexibility.score}
                  maxScore={10}
                  description={metrics.fitFlexibility.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.rideComfort.label}
                  score={metrics.rideComfort.score}
                  maxScore={10}
                  description={metrics.rideComfort.description}
                  variant="inline"
                />
              </div>
            </div>

            {/* Value Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5">Value</h3>
              <div className="grid grid-cols-3 gap-4">
                <ScoreCard
                  label={metrics.buildQuality.label}
                  score={metrics.buildQuality.score}
                  maxScore={10}
                  description={metrics.buildQuality.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.valueForMoney.label}
                  score={metrics.valueForMoney.score}
                  maxScore={10}
                  description={metrics.valueForMoney.description}
                  variant="inline"
                />
                <ScoreCard
                  label={metrics.surfaceRange.label}
                  score={metrics.surfaceRange.score}
                  maxScore={10}
                  description={metrics.surfaceRange.description}
                  variant="inline"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Bike Image at Top */}
            <div className="bg-white p-4 mb-4">
              {bike.images && bike.images.length > 0 ? (
                <div className="relative w-full h-64">
                  <Image
                    src={bike.images[0]}
                    alt={`${bike.brand} ${bike.model}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="px-5 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {bike.brand} {bike.model}
              </h1>

              {bike.sub_category && (
                <div className="inline-block bg-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
                  {bike.sub_category}
                </div>
              )}

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
                        className={`w-5 h-5 ${
                          i < Math.floor(metrics.overallScore / 2)
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
                />
                <ScoreCard
                  label={metrics.value.label}
                  score={metrics.value.score}
                  maxScore={metrics.value.maxScore}
                  description={metrics.value.description}
                />
                <ScoreCard
                  label={metrics.fit.label}
                  score={metrics.fit.score}
                  maxScore={metrics.fit.maxScore}
                  description={metrics.fit.description}
                />
                <ScoreCard
                  label={metrics.general.label}
                  score={metrics.general.score}
                  maxScore={metrics.general.maxScore}
                  description={metrics.general.description}
                />
              </div>

              {/* Performance Section - Mobile */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <ScoreCard
                    label={metrics.climingEfficiency.label}
                    score={metrics.climingEfficiency.score}
                    maxScore={10}
                    description={metrics.climingEfficiency.description}
                    variant="inline"
                  />
                  <ScoreCard
                    label={metrics.aerodynamics.label}
                    score={metrics.aerodynamics.score}
                    maxScore={10}
                    description={metrics.aerodynamics.description}
                    variant="inline"
                  />
                </div>
              </div>

              {/* Fit Score - Mobile */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fit Score</h3>
                <div className="space-y-3">
                  <ScoreCard
                    label={metrics.ridingPosition.label}
                    score={metrics.ridingPosition.score}
                    maxScore={10}
                    description={metrics.ridingPosition.description}
                    variant="inline"
                  />
                  <ScoreCard
                    label={metrics.handling.label}
                    score={metrics.handling.score}
                    maxScore={10}
                    description={metrics.handling.description}
                    variant="inline"
                  />
                  <ScoreCard
                    label={metrics.fitFlexibility.label}
                    score={metrics.fitFlexibility.score}
                    maxScore={10}
                    description={metrics.fitFlexibility.description}
                    variant="inline"
                  />
                  <ScoreCard
                    label={metrics.rideComfort.label}
                    score={metrics.rideComfort.score}
                    maxScore={10}
                    description={metrics.rideComfort.description}
                    variant="inline"
                  />
                </div>
              </div>

              {/* Value Section - Mobile */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Value</h3>
                <div className="space-y-3">
                  <ScoreCard
                    label={metrics.buildQuality.label}
                    score={metrics.buildQuality.score}
                    maxScore={10}
                    description={metrics.buildQuality.description}
                    variant="inline"
                  />
                  <ScoreCard
                    label={metrics.valueForMoney.label}
                    score={metrics.valueForMoney.score}
                    maxScore={10}
                    description={metrics.valueForMoney.description}
                    variant="inline"
                  />
                </div>
              </div>
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
      </div>
    </main>
  )
}
