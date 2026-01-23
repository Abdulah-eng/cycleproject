'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Dropdown options
const SUB_CATEGORIES = {
  Road: ['Endurance', 'Race', 'Aero', 'Climbing', 'Time Trial', 'Gravel'],
  Mountain: ['Cross-Country', 'Trail', 'Enduro', 'Downhill', 'Fat Bike'],
  Gravel: ['Adventure', 'Racing', 'Bikepacking'],
  Electric: ['E-Road', 'E-Mountain', 'E-Gravel', 'E-Commuter', 'E-Cargo'],
  Hybrid: ['Fitness', 'Commuter', 'Comfort', 'Trekking'],
}

const FRAME_MATERIALS = ['Carbon', 'Aluminum', 'Steel', 'Titanium', 'Carbon/Aluminum']

const BRAKE_TYPES = ['Hydraulic Disc', 'Mechanical Disc', 'Rim Brakes', 'V-Brake']

const SUSPENSION_TYPES = ['Rigid', 'Hardtail', 'Full Suspension']

const COMMON_BRANDS = [
  'Trek', 'Specialized', 'Giant', 'Cannondale', 'Canyon', 'Santa Cruz',
  'Scott', 'Cervelo', 'Pinarello', 'Bianchi', 'Colnago', 'BMC', 'Orbea',
  'Cube', 'Merida', 'Focus', 'Ridley', 'Wilier', 'De Rosa', 'Look'
]

interface EditProductFormProps {
  bike: any
}

export default function EditProductForm({ bike }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    brand: bike.brand || '',
    model: bike.model || '',
    year: bike.year || new Date().getFullYear(),
    category: bike.category || 'Road',
    sub_category: bike.sub_category || '',
    price: bike.price || '',
    weight: bike.weight || '',
    frame: bike.frame || '',
    suspension: bike.suspension || '',
    groupset: bike.groupset || '',
    wheels: bike.wheels || '',
    tires: bike.tires || '',
    brakes: bike.brakes || '',
    fork: bike.fork || '',
    vfm_score_1_to_10: bike.vfm_score_1_to_10 || '',
    build_1_10: bike.build_1_10 || '',
    speed_index: bike.speed_index || '',
    ride_comfort_1_10: bike.ride_comfort_1_10 || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // If category changes, reset sub_category
    if (name === 'category') {
      setFormData({ ...formData, [name]: value, sub_category: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Generate slug
      const slug = `${formData.brand}-${formData.model}-${formData.year}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Prepare data for insertion
      const bikeData = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year as any),
        slug,
        category: formData.category,
        sub_category: formData.sub_category || null,
        price: formData.price ? parseFloat(formData.price) : null,
        weight: formData.weight || null,
        frame: formData.frame || null,
        suspension: formData.suspension || null,
        groupset: formData.groupset || null,
        wheels: formData.wheels || null,
        tires: formData.tires || null,
        brakes: formData.brakes || null,
        fork: formData.fork || null,
        vfm_score_1_to_10: formData.vfm_score_1_to_10 ? parseInt(formData.vfm_score_1_to_10) : null,
        build_1_10: formData.build_1_10 ? parseInt(formData.build_1_10) : null,
        speed_index: formData.speed_index ? parseInt(formData.speed_index) : null,
        ride_comfort_1_10: formData.ride_comfort_1_10 ? parseInt(formData.ride_comfort_1_10) : null,
      }

      const response = await fetch(`/api/admin/bikes/${bike.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update bike')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">Update bike information</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✓ Product updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                list="brand-suggestions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., Trek"
              />
              <datalist id="brand-suggestions">
                {COMMON_BRANDS.map(brand => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., Domane SL 5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2000"
                max="2030"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="Road">Road</option>
                <option value="Mountain">Mountain</option>
                <option value="Gravel">Gravel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub Category
              </label>
              <select
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select sub-category (optional)</option>
                {SUB_CATEGORIES[formData.category as keyof typeof SUB_CATEGORIES]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 2999.99"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 8.5 kg or 18.7 lbs"
              />
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frame Material
              </label>
              <select
                name="frame"
                value={formData.frame}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select frame material (optional)</option>
                {FRAME_MATERIALS.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suspension
              </label>
              <select
                name="suspension"
                value={formData.suspension}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select suspension type (optional)</option>
                {SUSPENSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Groupset
              </label>
              <input
                type="text"
                name="groupset"
                value={formData.groupset}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., Shimano 105"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Wheels
              </label>
              <input
                type="text"
                name="wheels"
                value={formData.wheels}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 700c or 29in"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tires
              </label>
              <input
                type="text"
                name="tires"
                value={formData.tires}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 700x40mm or 29x2.3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brakes
              </label>
              <select
                name="brakes"
                value={formData.brakes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select brake type (optional)</option>
                {BRAKE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fork
              </label>
              <input
                type="text"
                name="fork"
                value={formData.fork}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., Carbon or RockShox Recon"
              />
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Value Score (1-10)
              </label>
              <input
                type="number"
                name="vfm_score_1_to_10"
                value={formData.vfm_score_1_to_10}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 8"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Build Quality (1-10)
              </label>
              <input
                type="number"
                name="build_1_10"
                value={formData.build_1_10}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 9"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speed Index
              </label>
              <input
                type="number"
                name="speed_index"
                value={formData.speed_index}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 85"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ride Comfort (1-10)
              </label>
              <input
                type="number"
                name="ride_comfort_1_10"
                value={formData.ride_comfort_1_10}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., 8"
              />
            </div>
          </div>
        </div>


        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Product'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
