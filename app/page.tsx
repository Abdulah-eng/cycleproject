import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'
import FeaturedBikes from '@/components/FeaturedBikes'
import StatsSection from '@/components/StatsSection'
import Footer from '@/components/Footer'

// Category descriptions mapping
const categoryDescriptions: Record<string, string> = {
  road: 'High-performance bikes for speed and endurance',
  mountain: 'Rugged bikes built for off-road adventures',
  gravel: 'Versatile bikes for mixed terrain riding',
  electric: 'Pedal-assist bikes for effortless riding',
  hybrid: 'Comfortable bikes for city commuting',
  bmx: 'Bikes for tricks and stunts',
  cruiser: 'Relaxed bikes for casual riding',
}

const categoryIcons: Record<string, string> = {
  road: '🚴',
  mountain: '🏔️',
  gravel: '🌾',
  electric: '⚡',
  hybrid: '🌆',
  bmx: '🎪',
  cruiser: '🌅',
}

export default async function Home() {
  // Fetch actual categories from database
  const { data: bikes } = await supabaseServer
    .from('bikes')
    .select('category, brand, price')

  // Get unique categories and count
  const categoryCounts = bikes?.reduce((acc, bike) => {
    const cat = bike.category
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const categories = Object.entries(categoryCounts).map(([category, count]) => {
    const slug = category.toLowerCase().replace(/\s+/g, '') + 'bikes'
    const key = category.toLowerCase().replace(/\s+/g, '')

    return {
      name: category,
      slug,
      description: categoryDescriptions[key] || `Discover our ${category.toLowerCase()} bikes`,
      count,
      icon: categoryIcons[key] || '🚲',
    }
  })

  // Get total bikes and brands
  const totalBikes = bikes?.length || 0
  const uniqueBrands = Array.from(new Set(bikes?.map(b => b.brand) || []))
  const avgPrice = bikes?.length
    ? Math.round(bikes.reduce((acc, b) => acc + (b.price || 0), 0) / bikes.length)
    : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-yellow-300">Cycling Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore our curated collection of premium bicycles from the world's leading brands.
              Whether you're racing, touring, or commuting, we have the perfect ride for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={categories.length > 0 ? `/${categories[0].slug}` : '/roadbikes'}
                className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                Browse Bikes
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#categories"
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all border-2 border-white/30 hover:border-white/50"
              >
                Explore Categories
              </a>
            </div>

            {/* Quick Stats */}
            {totalBikes > 0 && (
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">{totalBikes}+</div>
                  <div className="text-sm text-blue-200 mt-1">Premium Bikes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">{uniqueBrands.length}</div>
                  <div className="text-sm text-blue-200 mt-1">Top Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">{categories.length}</div>
                  <div className="text-sm text-blue-200 mt-1">Categories</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Bikes Section */}
      {totalBikes > 0 && <FeaturedBikes />}

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our diverse selection of bicycles designed for every riding style
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {categories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Category Icon Background */}
                  <div className="absolute top-0 right-0 text-9xl opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
                    {category.icon}
                  </div>

                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="text-5xl mb-4">{category.icon}</div>

                    {/* Content */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name} Bikes
                        </h3>
                        <span className="bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {category.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      Explore Collection
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-2xl transition-colors pointer-events-none"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No bikes available yet.</p>
              <p className="text-gray-400">Import bikes using: npm run import-data</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection totalBikes={totalBikes} brands={uniqueBrands.length} avgPrice={avgPrice} />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose BikeMax?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for finding the perfect bicycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="group text-center p-8 rounded-2xl hover:bg-blue-50 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Extensive Catalog</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse thousands of bikes from top brands worldwide. Every model meticulously documented with detailed specs and high-quality images.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-8 rounded-2xl hover:bg-green-50 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Detailed Specifications</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete technical specifications, performance metrics, and geometry data to help you make an informed decision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-8 rounded-2xl hover:bg-purple-50 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Smart Comparison</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare bikes with data-driven insights and performance ratings to find your perfect match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Dream Bike?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of cyclists who found their perfect ride with BikeMax
          </p>
          <Link
            href={categories.length > 0 ? `/${categories[0].slug}` : '/roadbikes'}
            className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Start Shopping Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer categories={categories} />
    </div>
  )
}
