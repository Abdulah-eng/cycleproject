'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BikeCard from '@/components/BikeCard'
import { Bike } from '@/lib/supabase'

interface SearchClientProps {
    dict: any
    lang: string
}

export default function SearchClient({ dict, lang }: SearchClientProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('q')
    const [results, setResults] = useState<Bike[]>([])
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState(query || '')

    useEffect(() => {
        if (query && query.trim().length >= 2) {
            setLoading(true)
            const sort = searchParams.get('sort') || 'year'
            fetch(`/api/search?q=${encodeURIComponent(query)}&sort=${sort}`)
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
            router.push(`/${lang}/search?q=${encodeURIComponent(searchInput.trim())}`)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-[70vh]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
                    {query ? `${dict?.nav?.search_placeholder || 'Search'} "${query}"` : (dict?.nav?.search_placeholder || 'Search Bikes')}
                </h1>

                <form onSubmit={handleSearch} className="mb-12">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={dict?.nav?.search_placeholder || "Search by brand, model, or category..."}
                                className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:shadow-blue-200"
                            >
                                {dict?.nav?.search_placeholder?.split(' ')[0] || 'Search'}
                            </button>
                        </div>

                        {/* Sorting Dropdown */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={searchParams.get('sort') || 'year'}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString())
                                    params.set('sort', e.target.value)
                                    if (!params.has('q') && searchInput.trim()) {
                                        params.set('q', searchInput.trim())
                                    }
                                    router.push(`/${lang}/search?${params.toString()}`)
                                }}
                                className="w-full h-full px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '0.75rem auto' }}
                            >
                                <option value="year">Newest First</option>
                                <option value="value">Best Value</option>
                                <option value="performance">Highest Performance</option>
                                <option value="comfort">Best Comfort</option>
                                <option value="position">Best Riding Position</option>
                            </select>
                        </div>
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
                            <BikeCard key={bike.id} bike={bike} categorySlug="" lang={lang} />
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{dict?.compare_page?.no_bikes || 'No bikes found'}</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {dict?.filters?.no_bikes_match || "We couldn't find any bikes matching your search."}
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
