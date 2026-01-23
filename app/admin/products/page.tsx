import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase'
import ProductRow from '@/components/admin/ProductRow'

export default async function ProductsPage() {
  // Fetch all bikes with pagination support
  const { data: bikes, error, count } = await supabaseServer
    .from('bikes')
    .select('id, brand, model, slug, category, price, images, year, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) {
    console.error('Error fetching bikes:', error)
  }

  const bikesList = bikes || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Manage your bike inventory</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Add Product
          </Link>
          <Link
            href="/admin/products/upload"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>📤</span>
            Upload CSV
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{bikesList.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(new Set(bikesList.map(b => b.category))).length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(new Set(bikesList.map(b => b.brand))).length}
          </div>
          <div className="text-sm text-gray-600">Brands</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {bikesList.filter(b => b.price).length}
          </div>
          <div className="text-sm text-gray-600">Priced Items</div>
        </div>
      </div>

      {/* Products Table */}
      {bikesList.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Brand & Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bikesList.map((bike) => (
                  <ProductRow key={bike.id} bike={bike} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first bike or uploading a CSV file</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add First Product
            </Link>
            <Link
              href="/admin/products/upload"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
