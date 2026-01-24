'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Category {
  name: string
  slug: string
  count: number
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
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
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Admin Link */}
          <Link
            href="/admin/login"
            className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
