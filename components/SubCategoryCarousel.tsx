'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCategoryForUrl } from '@/lib/utils'

interface SubCategory {
    name: string
    displayName: string
    category: string
    slug: string
    image: string
}

interface SubCategoryCarouselProps {
    subCategories: SubCategory[]
    lang: string
}

export default function SubCategoryCarousel({ subCategories, lang }: SubCategoryCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const itemsPerPage = 4

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev + itemsPerPage >= subCategories.length ? 0 : prev + itemsPerPage
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev - itemsPerPage < 0 ? Math.max(0, subCategories.length - itemsPerPage) : prev - itemsPerPage
        )
    }

    const visibleItems = subCategories.slice(currentIndex, currentIndex + itemsPerPage)
    // If we are at the end and don't fill the page, we might want to pad with earlier items or just show what's left.
    // For simplicity and "one line" feel, just showing visible items is fine. 
    // Ideally we want 4 always if possible ? No, standard pagination is fine.

    return (
        <div className="relative px-12">
            {/* Navigation Buttons */}
            {subCategories.length > itemsPerPage && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white text-slate-900 border border-slate-200 p-3 rounded-full shadow-lg hover:bg-slate-50 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Previous items"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-slate-900 border border-slate-200 p-3 rounded-full shadow-lg hover:bg-slate-50 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Next items"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleItems.map((sc) => (
                    <Link
                        key={sc.name}
                        href={`/${lang}/${formatCategoryForUrl(sc.category)}bikes/${sc.slug}`}
                        className="group relative h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                        <Image
                            src={sc.image}
                            alt={sc.displayName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-blue-900/30 transition-colors"></div>
                        <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl text-center">
                                <h3 className="text-xl font-bold text-white tracking-wide uppercase">{sc.displayName}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Dots Indicator */}
            {subCategories.length > itemsPerPage && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(subCategories.length / itemsPerPage) }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx * itemsPerPage)}
                            className={`w-3 h-3 rounded-full transition-colors ${Math.floor(currentIndex / itemsPerPage) === idx
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to page ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
