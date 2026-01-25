import { Bike, BikeMetrics, BikeScore } from './supabase'

/**
 * Generate a URL-friendly slug from brand and model
 */
export function generateSlug(brand: string, model: string, year?: number | null): string {
  const text = `${brand}-${model}${year ? `-${year}` : ''}`
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Calculate bike metrics from raw data
 */
export function calculateBikeMetrics(bike: Bike): BikeMetrics {
  // Performance Score (average of climbing and aerodynamics)
  const climbScore = bike.climb_1_10 || 5
  const aeroScore = bike.aero_1_10 || 5
  const performanceScore = Math.round(((climbScore + aeroScore) / 2) * 10) / 10

  // Value Score
  const valueScore = bike.vfm_score_1_to_10 || 5

  // Fit Score (average of fit flexibility and posture)
  const fitFlexScore = bike.fit_flexibility_1_10 || 5
  const postureScore = bike.posture_1_10 || 5
  const fitScore = Math.round(((fitFlexScore + postureScore) / 2) * 10) / 10

  // General Score (average of build quality and ride comfort)
  const buildScore = bike.build_1_10 || 5
  const comfortScore = bike.ride_comfort_1_10 || 5
  const generalScore = Math.round(((buildScore + comfortScore) / 2) * 10) / 10

  // Overall Score
  const overallScore = Math.round(((performanceScore + valueScore + fitScore + generalScore) / 4) * 10) / 10

  // Get descriptive labels
  const getPerformanceLabel = (score: number): string => {
    if (score >= 8.5) return 'Excellent Climber'
    if (score >= 7) return 'Good Climber'
    if (score >= 5.5) return 'Moderate Climber'
    return 'City Climber'
  }

  const getValueLabel = (score: number): string => {
    if (score >= 8) return 'Extreme Value'
    if (score >= 6.5) return 'Strong Value'
    if (score >= 5) return 'Good Value'
    return 'Premium Pricing'
  }

  const getFitLabel = (score: number): string => {
    if (score >= 8) return 'Optimal Fit'
    if (score >= 6) return 'Highly Adaptable'
    if (score >= 4) return 'Versatile'
    return 'Race Specific Fit'
  }

  const getBuildLabel = (score: number): string => {
    if (score >= 8) return 'Premium Build'
    if (score >= 6) return 'Strong Build'
    if (score >= 4) return 'Solid Build'
    return 'Basic Build'
  }

  const getPostureLabel = (score: number): string => {
    if (score <= 3) return 'Aggressive'
    if (score <= 5) return 'Sporty'
    if (score <= 7) return 'Balanced'
    return 'Relaxed'
  }

  const getAeroLabel = (score: number): string => {
    if (score >= 8) return 'Very Aero'
    if (score >= 6) return 'Aero'
    if (score >= 4) return 'Moderate Aero'
    return 'Non-Aero'
  }

  const getComfortLabel = (score: number): string => {
    if (score >= 8.5) return 'Endurance Focused'
    if (score >= 7) return 'High Comfort'
    if (score >= 5) return 'Everyday Comfort'
    return 'Race Aggressive'
  }

  const getResponsivenessLabel = (score: number): string => {
    if (score >= 8) return 'Highly Responsive'
    if (score >= 6) return 'Precise Control'
    if (score >= 4) return 'Balanced Handling'
    return 'Stable'
  }

  const getSpeedLabel = (score: number): string => {
    if (score >= 8.5) return 'Extremely Fast'
    if (score >= 7) return 'Very Fast'
    if (score >= 5.5) return 'Fast'
    if (score >= 4) return 'Moderate Speed'
    return 'Relaxed Pace'
  }

  const speedScore = bike.speed_index || 5

  const getBatteryLabel = (score: number): string => {
    if (score >= 8) return 'Excellent Range'
    if (score >= 6) return 'Good Range'
    if (score >= 4) return 'Moderate Range'
    return 'Limited Range'
  }

  const isEBike = bike.category?.toLowerCase().includes('e-bike') ||
                  bike.category?.toLowerCase().includes('e-road') ||
                  bike.category?.toLowerCase().includes('e-mountain')

  return {
    overallScore,
    performance: {
      label: 'Performance',
      score: performanceScore,
      maxScore: 10,
      description: getPerformanceLabel(performanceScore),
    },
    value: {
      label: 'Value',
      score: valueScore,
      maxScore: 10,
      description: getValueLabel(valueScore),
    },
    fit: {
      label: 'Fit',
      score: fitScore,
      maxScore: 10,
      description: getFitLabel(fitScore),
    },
    general: {
      label: 'General',
      score: generalScore,
      maxScore: 10,
      description: getBuildLabel(generalScore),
    },
    speed: {
      label: 'Speed',
      score: speedScore,
      maxScore: 10,
      description: bike.speed_bucket || getSpeedLabel(speedScore),
    },
    climingEfficiency: {
      label: 'Climbing Efficiency',
      score: climbScore,
      maxScore: 10,
      description: bike.climb_bucket || getPerformanceLabel(climbScore),
    },
    aerodynamics: {
      label: 'Aerodynamics',
      score: aeroScore,
      maxScore: 10,
      description: bike.aero_bucket || getAeroLabel(aeroScore),
    },
    ridingPosition: {
      label: 'Riding Position',
      score: postureScore,
      maxScore: 10,
      description: bike.posture_bucket || getPostureLabel(postureScore),
    },
    handling: {
      label: 'Handling',
      score: bike.responsiveness_1_10 || 5,
      maxScore: 10,
      description: bike.responsiveness_bucket || getResponsivenessLabel(bike.responsiveness_1_10 || 5),
    },
    fitFlexibility: {
      label: 'Fit Flexibility',
      score: fitFlexScore,
      maxScore: 10,
      description: bike.fit_flexibility_bucket || getFitLabel(fitFlexScore),
    },
    rideComfort: {
      label: 'Ride Comfort',
      score: comfortScore,
      maxScore: 10,
      description: bike.ride_comfort_bucket || getComfortLabel(comfortScore),
    },
    buildQuality: {
      label: 'Build Quality',
      score: buildScore,
      maxScore: 10,
      description: bike.build_bucket || getBuildLabel(buildScore),
    },
    valueForMoney: {
      label: 'Value for Money',
      score: valueScore,
      maxScore: 10,
      description: bike.vfm_score_bucket || getValueLabel(valueScore),
    },
    surfaceRange: {
      label: 'Surface Range',
      score: 8.4, // Default, can be calculated based on surface_range field
      maxScore: 10,
      description: bike.surface_range || 'All-Road Capable',
    },
    battery: isEBike ? {
      label: 'Battery',
      score: 7, // Default, can be calculated based on battery fields
      maxScore: 10,
      description: bike.battery_bucket || getBatteryLabel(7),
    } : undefined,
  }
}

/**
 * Format price with currency
 */
export function formatPrice(price: number | null): string {
  if (!price) return 'Price not available'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Parse geometry data from multi-line string to structured object
 */
export function parseGeometryData(geometryData: string | null): Record<string, string[]> {
  if (!geometryData) return {}

  const lines = geometryData.split('\n').filter(line => line.trim())
  const result: Record<string, string[]> = {}

  lines.forEach(line => {
    const parts = line.split('//')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const values = parts.slice(1).map(v => v.trim())
      result[key] = values
    }
  })

  return result
}

/**
 * Get rating color based on score
 */
export function getRatingColor(score: number): string {
  if (score >= 8.5) return '#10b981' // green
  if (score >= 7) return '#3b82f6' // blue
  if (score >= 5.5) return '#f59e0b' // orange
  return '#ef4444' // red
}

/**
 * Format category for URL
 */
export function formatCategoryForUrl(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '')
}

/**
 * Generate SEO-friendly URL slug from text
 */
export function generateUrlSlug(text: string | null): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Generate new SEO-friendly bike URL
 * Format: /category/sub-category/brand/year/model
 */
export function generateBikeUrl(bike: {
  category: string
  sub_category?: string | null
  brand: string
  year?: number | null
  model: string
  slug?: string // Old slug for fallback
}): string {
  const categorySlug = formatCategoryForUrl(bike.category) + 'bikes'
  const subCategorySlug = bike.sub_category ? generateUrlSlug(bike.sub_category) : 'general'
  const brandSlug = generateUrlSlug(bike.brand)
  const yearSlug = bike.year ? bike.year.toString() : 'unknown'
  const modelSlug = generateUrlSlug(bike.model)

  return `/${categorySlug}/${subCategorySlug}/${brandSlug}/${yearSlug}/${modelSlug}`
}

/**
 * Parse bike details from new URL format
 */
export function parseBikeUrl(segments: string[]): {
  category: string
  subCategory: string
  brand: string
  year: string
  model: string
} | null {
  if (segments.length < 5) return null

  return {
    category: segments[0],
    subCategory: segments[1],
    brand: segments[2],
    year: segments[3],
    model: segments[4],
  }
}
