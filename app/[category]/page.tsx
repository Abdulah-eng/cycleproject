import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase'
import CategoryPageContent from '@/components/CategoryPageContent'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

const INITIAL_LOAD = 15

async function getInitialBikes(categorySlug: string) {
  // Convert slug back to category name (e.g., 'roadbikes' -> 'Road')
  const categoryName = categorySlug
    .replace(/bikes$/i, '') // Remove 'bikes' at the end
    .trim()

  console.log('🔍 Category Query:', {
    slug: categorySlug,
    searchTerm: categoryName,
    pattern: `%${categoryName}%`
  })

  // Fetch first batch + total count
  const { data, error, count } = await supabaseServer
    .from('bikes')
    .select('id, brand, model, year, price, slug, category, sub_category, images, vfm_score_1_to_10, build_1_10, speed_index, frame', { count: 'exact' })
    .ilike('category', `%${categoryName}%`)
    .order('year', { ascending: false })
    .order('brand', { ascending: true })
    .range(0, INITIAL_LOAD - 1)

  if (error) {
    console.error('❌ Error fetching bikes:', error)
    return { bikes: [], totalCount: 0 }
  }

  console.log('📊 Initial Load:', {
    loaded: data?.length || 0,
    total: count || 0
  })

  return {
    bikes: data || [],
    totalCount: count || 0
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { bikes, totalCount } = await getInitialBikes(params.category)

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
            Browse {totalCount.toLocaleString()} {categoryName.toLowerCase()} in our catalog
          </p>
        </div>

        {/* Bike Grid with Filters and Sorting */}
        {bikes && bikes.length > 0 ? (
          <CategoryPageContent
            initialBikes={bikes}
            categorySlug={params.category}
            totalCount={totalCount}
          />
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
