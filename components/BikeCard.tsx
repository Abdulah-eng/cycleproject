import Link from 'next/link'
import Image from 'next/image'
import { generateBikeUrl } from '@/lib/utils'

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
}

interface BikeCardProps {
  bike: Bike
  categorySlug: string
}

export default function BikeCard({ bike, categorySlug }: BikeCardProps) {
  const imageUrl = bike.images && bike.images.length > 0 ? bike.images[0] : null
  const overallScore = ((bike.vfm_score_1_to_10 || 5) + (bike.build_1_10 || 5)) / 2

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price not available'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Generate new SEO-friendly URL
  const bikeUrl = generateBikeUrl(bike)

  return (
    <Link
      href={bikeUrl}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${bike.brand} ${bike.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overall Score Badge */}
        <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md">
          <span className="text-sm font-bold text-gray-900">{overallScore.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
          {bike.model}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{bike.brand}</p>

        {bike.sub_category && (
          <p className="text-xs text-gray-500 mb-3">{bike.sub_category}</p>
        )}

        {/* Scores */}
        <div className="flex items-center gap-3 mb-3 text-xs">
          {bike.vfm_score_1_to_10 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Value:</span>
              <span className="font-semibold text-gray-900">{bike.vfm_score_1_to_10.toFixed(1)}</span>
            </div>
          )}
          {bike.build_1_10 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Build:</span>
              <span className="font-semibold text-gray-900">{bike.build_1_10.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price and Year */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(bike.price)}</span>
          {bike.year && (
            <span className="text-sm text-gray-500">{bike.year}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
