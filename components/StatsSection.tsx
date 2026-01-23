'use client'

import { useState, useEffect } from 'react'

interface StatsSectionProps {
  totalBikes: number
  brands: number
  avgPrice: number
}

export default function StatsSection({ totalBikes, brands, avgPrice }: StatsSectionProps) {
  const [counts, setCounts] = useState({ bikes: 0, brands: 0, price: 0 })

  useEffect(() => {
    // Animate numbers on mount
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounts({
        bikes: Math.floor(totalBikes * progress),
        brands: Math.floor(brands * progress),
        price: Math.floor(avgPrice * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setCounts({ bikes: totalBikes, brands, price: avgPrice })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [totalBikes, brands, avgPrice])

  if (totalBikes === 0) return null

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            By the Numbers
          </h2>
          <p className="text-xl text-blue-200">
            Your one-stop destination for premium bicycles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {/* Stat 1 */}
          <div className="text-center group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl font-bold text-yellow-400 mb-2 tabular-nums">
                {counts.bikes.toLocaleString()}+
              </div>
              <div className="text-xl font-semibold mb-2">Premium Bikes</div>
              <p className="text-blue-200 text-sm">
                Carefully curated collection from top manufacturers
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="text-center group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl font-bold text-yellow-400 mb-2 tabular-nums">
                {counts.brands}
              </div>
              <div className="text-xl font-semibold mb-2">Top Brands</div>
              <p className="text-blue-200 text-sm">
                Leading bicycle manufacturers worldwide
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="text-center group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl font-bold text-yellow-400 mb-2 tabular-nums">
                ${(counts.price / 1000).toFixed(1)}k
              </div>
              <div className="text-xl font-semibold mb-2">Average Price</div>
              <p className="text-blue-200 text-sm">
                Quality bikes for every budget
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-green-400 text-2xl">✓</span>
            <span className="font-semibold">All bikes come with detailed specifications and performance ratings</span>
          </div>
        </div>
      </div>
    </section>
  )
}
