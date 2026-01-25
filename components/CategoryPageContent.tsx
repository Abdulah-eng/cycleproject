'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import BikeCard from './BikeCard'

interface Bike {
  id: number
  brand: string
  model: string
  year: number | null
  price: number | null
  slug: string
  category: string
  sub_category: string | null
  images: string[] | null
  vfm_score_1_to_10: number | null
  build_1_10: number | null
  speed_index: number | null
  frame: string | null
}

interface CategoryPageContentProps {
  initialBikes: Bike[]
  categorySlug: string
  totalCount: number
}

export default function CategoryPageContent({ initialBikes, categorySlug, totalCount }: CategoryPageContentProps) {
  const [bikes, setBikes] = useState<Bike[]>(initialBikes)
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>(initialBikes)
  const [loading, setLoading] = useState(false)

  // Filter states
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedFrame, setSelectedFrame] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000])

  // Sort state
  const [sortBy, setSortBy] = useState<string>('newest')

  // Pagination state
  const [displayCount, setDisplayCount] = useState(15)
  const [hasMore, setHasMore] = useState(initialBikes.length >= 15)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Get unique values for filters
  const subCategories = Array.from(new Set(bikes.map(b => b.sub_category).filter(Boolean)))
  const brands = Array.from(new Set(bikes.map(b => b.brand).filter(Boolean))).sort()
  const frames = Array.from(new Set(bikes.map(b => b.frame).filter(Boolean))).sort()
  const years = Array.from(new Set(bikes.map(b => b.year).filter(Boolean))).sort((a, b) => (b as number) - (a as number))

  // Load all bikes for filtering
  useEffect(() => {
    const loadAllBikes = async () => {
      if (bikes.length >= totalCount) return

      setLoading(true)
      try {
        const categoryName = categorySlug.replace(/bikes$/i, '').trim()
        const response = await fetch(
          `/api/bikes?category=${encodeURIComponent(categoryName)}&limit=1000`
        )
        const data = await response.json()
        if (data.bikes) {
          setBikes(data.bikes)
        }
      } catch (error) {
        console.error('Error loading bikes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllBikes()
  }, [categorySlug, totalCount, bikes.length])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...bikes]

    // Apply filters
    if (selectedSubCategory) {
      result = result.filter(b => b.sub_category === selectedSubCategory)
    }
    if (selectedBrand) {
      result = result.filter(b => b.brand === selectedBrand)
    }
    if (selectedFrame) {
      result = result.filter(b => b.frame === selectedFrame)
    }
    if (selectedYear) {
      result = result.filter(b => b.year?.toString() === selectedYear)
    }
    if (priceRange[0] > 0 || priceRange[1] < 20000) {
      result = result.filter(b => {
        if (!b.price) return false
        return b.price >= priceRange[0] && b.price <= priceRange[1]
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'score':
        result.sort((a, b) => {
          const scoreA = ((a.vfm_score_1_to_10 || 0) + (a.build_1_10 || 0)) / 2
          const scoreB = ((b.vfm_score_1_to_10 || 0) + (b.build_1_10 || 0)) / 2
          return scoreB - scoreA
        })
        break
      default:
        result.sort((a, b) => a.brand.localeCompare(b.brand))
    }

    setFilteredBikes(result)
    setDisplayCount(15)
    setHasMore(result.length > 15)
  }, [bikes, selectedSubCategory, selectedBrand, selectedFrame, selectedYear, priceRange, sortBy])

  const loadMore = useCallback(() => {
    const newCount = displayCount + 15
    setDisplayCount(newCount)
    setHasMore(newCount < filteredBikes.length)
  }, [displayCount, filteredBikes.length])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loadMore])

  const resetFilters = () => {
    setSelectedSubCategory('')
    setSelectedBrand('')
    setSelectedFrame('')
    setSelectedYear('')
    setPriceRange([0, 20000])
    setSortBy('newest')
  }

  const displayedBikes = filteredBikes.slice(0, displayCount)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="score">Overall Score</option>
              </select>
            </div>

            {/* Sub Category */}
            {subCategories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Category
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">All</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub as string}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand as string}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Frame */}
            {frames.length > 0 && frames.length < 50 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frame Material
                </label>
                <select
                  value={selectedFrame}
                  onChange={(e) => setSelectedFrame(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">All Frames</option>
                  {frames.slice(0, 20).map((frame) => (
                    <option key={frame} value={frame as string}>
                      {frame}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Year */}
            {years.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year?.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full bg-white"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBikes.length}</span> bikes
            </p>
          </div>
        </div>
      </aside>

      {/* Bike Grid */}
      <div className="flex-1">
        {loading && bikes.length === initialBikes.length && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading all bikes...</p>
          </div>
        )}

        {displayedBikes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBikes.map((bike) => (
                <BikeCard
                  key={bike.id}
                  bike={bike}
                  categorySlug={categorySlug}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={observerTarget} className="mt-8 text-center py-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
              </div>
            )}

            {displayCount > 15 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ↑ Back to Top
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No bikes match your filters.</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
