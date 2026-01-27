'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useComparison } from '@/context/ComparisonContext'

interface Category {
  name: string
  slug: string
  count: number
}

interface SearchSuggestion {
  id: number
  label: string
  brand: string
  model: string
  year: number | null
  category: string
  sub_category: string | null
  slug: string
  price: number | null
  image: string | null
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'
  const { selectedBikes } = useComparison()

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          // Take top 5 categories by count for the header
          setCategories(data.categories.slice(0, 5))
        }
      })
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        if (data.suggestions) {
          setSuggestions(data.suggestions)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Generate new SEO-friendly URL
    const categorySlug = suggestion.category.toLowerCase().replace(/\s+/g, '') + 'bikes'
    const subCategorySlug = suggestion.sub_category
      ? suggestion.sub_category.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      : 'general'
    const brandSlug = suggestion.brand.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    const yearSlug = suggestion.year ? suggestion.year.toString() : 'unknown'
    const modelSlug = suggestion.model.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

    const newUrl = `/${categorySlug}/${subCategorySlug}/${brandSlug}/${yearSlug}/${modelSlug}`
    router.push(newUrl)
    setSearchQuery('')
    setShowSuggestions(false)
    setIsSearchOpen(false)
  }

  const formatPrice = (price: number | null) => {
    if (!price) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format category name for display (shorten if needed)
  const formatCategoryName = (name: string) => {
    const lower = name.toLowerCase().replace(/[-\s]/g, '') // Remove dashes and spaces for comparison

    // Check for e-bike mountain variants (must check BEFORE generic e-bike)
    if (lower.includes('ebikemountain') || lower.includes('emtb')) {
      return 'E-MTB'
    }
    // Check for e-bike road variants
    if (lower.includes('ebikeroad') || lower.includes('eroad')) {
      return 'E-Road'
    }
    // Generic e-bike (only if not mountain or road)
    if (lower.includes('ebike') || lower.includes('electric')) {
      return 'E-Bike'
    }

    // Return the name as-is for simple categories
    return name
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">
              BikeMax
            </div>
          </Link>

          {/* Desktop Navigation - Dynamic Categories */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  title={`${category.name} (${category.count} bikes)`}
                >
                  {formatCategoryName(category.name)}
                </Link>
              ))
            ) : (
              // Fallback while loading
              <>
                <span className="text-gray-400">Road</span>
                <span className="text-gray-400">Mountain</span>
                <span className="text-gray-400">E-Bike</span>
              </>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search bikes..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion.image ? (
                        <Image
                          src={suggestion.image}
                          alt={suggestion.label}
                          width={50}
                          height={50}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{suggestion.label}</p>
                        <p className="text-xs text-gray-500">{suggestion.sub_category || suggestion.category}</p>
                      </div>
                      {suggestion.price && (
                        <div className="text-sm font-semibold text-gray-700">
                          {formatPrice(suggestion.price)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {isLoadingSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-gray-500 text-center">Searching...</p>
                </div>
              )}

              {/* No Results State */}
              {showSuggestions && !isLoadingSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-gray-500 text-center">No bikes found. Try a different search term.</p>
                </div>
              )}
            </form>
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Admin Link & Compare Link */}
          <div className="hidden md:flex items-center gap-4">
            {/* Compare Link */}
            <Link
              href="/compare"
              className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
            >
              Compare
              {selectedBikes.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedBikes.length}
                </span>
              )}
            </Link>

            {/* Admin Link */}
            <Link
              href="/admin/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search bikes..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion.image ? (
                        <Image
                          src={suggestion.image}
                          alt={suggestion.label}
                          width={50}
                          height={50}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{suggestion.label}</p>
                        <p className="text-xs text-gray-500">{suggestion.sub_category || suggestion.category}</p>
                      </div>
                      {suggestion.price && (
                        <div className="text-sm font-semibold text-gray-700">
                          {formatPrice(suggestion.price)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
