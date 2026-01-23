import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export const revalidate = 3600 // Revalidate every hour

interface PageProps {
  params: {
    category: string
  }
}

// Generate static params for categories
export async function generateStaticParams() {
  const { data: bikes } = await supabaseServer
    .from('bikes')
    .select('category')

  if (!bikes) return []

  const uniqueCategories = Array.from(new Set(bikes.map(b => b.category)))

  return uniqueCategories.map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, ''),
  }))
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryName = params.category
    .replace(/bikes$/i, ' Bikes')
    .replace(/([A-Z])/g, ' $1')
    .trim()

  return {
    title: `${categoryName} - BikeMax Catalog`,
    description: `Browse our extensive collection of ${categoryName.toLowerCase()}. Find detailed specs, performance metrics, and reviews.`,
  }
}

async function getCategoryBikes(categorySlug: string) {
  // Convert slug back to category name (e.g., 'roadbikes' -> 'Road')
  // Remove 'bikes' suffix and capitalize first letter
  const categoryName = categorySlug
    .replace(/bikes$/i, '') // Remove 'bikes' at the end
    .trim()

  console.log('🔍 Category Query:', {
    slug: categorySlug,
    searchTerm: categoryName,
    pattern: `%${categoryName}%`
  })

  const { data, error } = await supabaseServer
    .from('bikes')
    .select('id, brand, model, year, price, slug, category, sub_category, images, vfm_score_1_to_10, build_1_10, speed_index')
    .ilike('category', `%${categoryName}%`) // Case-insensitive search
    .order('brand', { ascending: true })
    .order('model', { ascending: true })

  console.log('📊 Query Result:', {
    error: error?.message,
    count: data?.length,
    categories: data?.map(b => b.category).filter((v, i, a) => a.indexOf(v) === i)
  })

  if (error) {
    console.error('❌ Error fetching bikes:', error)
    return []
  }

  return data || []
}

export default async function CategoryPage({ params }: PageProps) {
  const bikes = await getCategoryBikes(params.category)

  const categoryName = params.category
    .replace(/bikes$/i, ' Bikes')
    .replace(/([A-Z])/g, ' $1')
    .trim()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            Browse {bikes.length} {categoryName.toLowerCase()} in our catalog
          </p>
        </div>

        {/* Bike Grid */}
        {bikes && bikes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bikes.map((bike) => (
            <Link
              key={bike.id}
              href={`/${params.category}/${bike.slug}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-bike bg-gray-100">
                {bike.images && bike.images.length > 0 ? (
                  <Image
                    src={bike.images[0]}
                    alt={`${bike.brand} ${bike.model}`}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {bike.brand}
                  </h2>
                  <h3 className="text-sm text-gray-600">{bike.model}</h3>
                </div>

                {bike.sub_category && (
                  <div className="mb-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {bike.sub_category}
                    </span>
                  </div>
                )}

                {bike.price && (
                  <div className="text-xl font-bold text-gray-900 mb-3">
                    {formatPrice(bike.price)}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex gap-2 text-xs">
                  {bike.vfm_score_1_to_10 && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-semibold text-gray-900">
                        {bike.vfm_score_1_to_10}/10
                      </span>
                    </div>
                  )}
                  {bike.build_1_10 && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Build:</span>
                      <span className="font-semibold text-gray-900">
                        {bike.build_1_10}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bikes Found</h3>
              <p className="text-gray-600 mb-6">
                We don't have any bikes in the {categoryName.toLowerCase()} category yet.
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse All Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
