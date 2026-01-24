import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  // Search bikes by brand, model, or category
  const { data: bikes } = await supabaseServer
    .from('bikes')
    .select('id, brand, model, slug, category, price, images, year')
    .or(`brand.ilike.%${query}%,model.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(50)

  const results = bikes || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {query ? (
              <>
                Found <span className="font-semibold">{results.length}</span> results for "{query}"
              </>
            ) : (
              'Enter a search term to find bikes'
            )}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((bike) => {
              const categorySlug = bike.category.toLowerCase().replace(/\s+/g, '') + 'bikes'
              return (
                <Link
                  key={bike.id}
                  href={`/${categorySlug}/${bike.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-100">
                    {bike.images && bike.images.length > 0 ? (
                      <Image
                        src={bike.images[0]}
                        alt={`${bike.brand} ${bike.model}`}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1 uppercase">
                      {bike.category}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {bike.brand} {bike.model}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{bike.year}</p>
                      {bike.price && (
                        <p className="font-bold text-gray-900">{formatPrice(bike.price)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : query ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any bikes matching "{query}"
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Bikes
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🚴</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">
              Use the search bar above to find bikes by brand, model, or category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
