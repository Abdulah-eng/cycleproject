import Link from 'next/link'
import { supabaseServer, fetchAllBikes } from '@/lib/supabase'
import RecentBikes from '@/components/admin/RecentBikes'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Fetch statistics using batch pagination (bypasses 1000 row limit)
  const [bikes, recentResult] = await Promise.all([
    fetchAllBikes<{ id: number; price: number | null; category: string; brand: string }>(
      async (from, to) => {
        const result = await supabaseServer
          .from('bikes')
          .select('id, price, category, brand')
          .range(from, to)
        return result
      }
    ),
    supabaseServer
      .from('bikes')
      .select('id, brand, model, category, created_at, price')
      .order('created_at', { ascending: false })
      .limit(5),
  ])
  const totalBikes = bikes.length
  const avgPrice = bikes.length > 0
    ? bikes.reduce((sum, bike) => sum + (bike.price || 0), 0) / bikes.length
    : 0

  const categories = Array.from(new Set(bikes.map(b => b.category))).length
  const brands = Array.from(new Set(bikes.map(b => b.brand))).length
  const recentBikes = recentResult.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your BikeMax admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bikes"
          value={totalBikes.toLocaleString()}
          icon="🚴"
          color="blue"
        />
        <StatCard
          title="Categories"
          value={categories}
          icon="📁"
          color="green"
        />
        <StatCard
          title="Brands"
          value={brands}
          icon="🏷️"
          color="purple"
        />
        <StatCard
          title="Avg Price"
          value={`$${Math.round(avgPrice).toLocaleString()}`}
          icon="💰"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            href="/admin/products/new"
            title="Add Single Product"
            description="Manually add a new bike to the catalog"
            icon="➕"
            color="blue"
          />
          <ActionCard
            href="/admin/products/upload"
            title="Upload CSV"
            description="Bulk upload bikes via CSV file"
            icon="📤"
            color="green"
          />
          <ActionCard
            href="/admin/products"
            title="View All Products"
            description="Browse and manage your inventory"
            icon="📦"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <RecentBikes bikes={recentBikes} />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}

function ActionCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  }

  return (
    <Link
      href={href}
      className="block bg-gradient-to-br p-6 rounded-xl text-white hover:shadow-lg transition-all transform hover:-translate-y-1"
      style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
    >
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-xl`}>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>
    </Link>
  )
}
