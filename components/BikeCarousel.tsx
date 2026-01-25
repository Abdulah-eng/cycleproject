'use client'

import { useRef } from 'react'
import BikeCard from './BikeCard'
import { Bike } from '@/lib/supabase'

interface BikeCarouselProps {
    title: string
    bikes: Bike[]
    categorySlug?: string
}

export default function BikeCarousel({ title, bikes, categorySlug }: BikeCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const scrollAmount = container.clientWidth * 0.8
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (!bikes || bikes.length === 0) return null

    return (
        <div className="py-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Scroll left"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Scroll right"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {bikes.map((bike) => (
                    <div key={bike.id} className="w-80 flex-shrink-0 snap-start">
                        <BikeCard
                            bike={bike}
                            categorySlug={categorySlug || bike.category.toLowerCase().replace(/\s+/g, '') + 'bikes'}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
