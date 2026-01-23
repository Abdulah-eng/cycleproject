'use client'

interface Bike {
  id: number
  brand: string
  model: string
  category: string
  price: number | null
  created_at: string
}

interface RecentBikesProps {
  bikes: Bike[]
}

export default function RecentBikes({ bikes }: RecentBikesProps) {
  if (bikes.length === 0) {
    return <p className="text-gray-500 text-center py-8">No products yet</p>
  }

  return (
    <div className="space-y-3">
      {bikes.map((bike) => (
        <div
          key={bike.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <h3 className="font-semibold text-gray-900">
              {bike.brand} {bike.model}
            </h3>
            <p className="text-sm text-gray-500">{bike.category}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${bike.price?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(bike.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
