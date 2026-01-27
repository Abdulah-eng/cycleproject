'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BikeCard from '@/components/BikeCard'
import { Bike } from '@/lib/supabase'

export default function SearchPage({ params }: { params: { lang: string } }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('q')
    const [results, setResults] = useState<Bike[]>([])
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState(query || '')

    useEffect(() => {
        if (query && query.trim().length >= 2) {
            setLoading(true)
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(res => {
                    if (res.ok) return res.json()
                    return { bikes: [] }
                })
                .then(data => setResults(data.bikes || []))
                .finally(() => setLoading(false))
        } else {
            setResults([])
        }
    }, [query])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchInput.trim().length >= 2) {
            router.push(`/${params.lang}/search?q=${encodeURIComponent(searchInput.trim())}`)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-[70vh]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
                    {query ? `Search Results for "${query}"` : 'Search Bikes'}
                </h1>

                <form onSubmit={handleSearch} className="mb-12">
                    <div className="relative flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by brand, model, or category..."
                            className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:shadow-blue-200"
                        >
                            Search
                        </button>
                    </div>
                    {query && query.trim().length < 2 && (
                        <p className="mt-2 text-sm text-amber-600">Please enter at least 2 characters to search.</p>
                    )}
                </form>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse bg-gray-100 rounded-3xl h-80"></div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {results.map(bike => (
                            <BikeCard key={bike.id} bike={bike} categorySlug="" />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bikes found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn't find any bikes matching your search. Try different keywords or browse by category.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Enter a search term above to discover your next ride.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
