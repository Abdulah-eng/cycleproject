'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import BikeCard from '@/components/BikeCard'
import { Bike } from '@/lib/supabase'

export default function SearchPage({ params }: { params: { lang: string } }) {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')
    const [results, setResults] = useState<Bike[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query) {
            setLoading(true)
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(res => {
                    if (res.ok) return res.json()
                    return { bikes: [] }
                })
                .then(data => setResults(data.bikes || []))
                .finally(() => setLoading(false))
        }
    }, [query])

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Search Results for "{query}"</h1>
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(bike => (
                        <BikeCard key={bike.id} bike={bike} categorySlug="" />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">No results found.</p>
            )}
        </div>
    )
}
