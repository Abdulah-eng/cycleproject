import { MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase'
import { generateBikeUrl, formatCategoryForUrl } from '@/lib/utils'

export const revalidate = 86400 // Revalidate daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.matchbikes.com'
  const languages = ['en', 'fr', 'de', 'es', 'it', 'nl']
  
  const sitemapUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ]

  for (const lang of languages) {
    sitemapUrls.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  // Fetch all bikes (with needed fields)
  // To avoid hitting limits, we might want to just get what we need
  try {
    const { data: bikes } = await supabaseServer
      .from('bikes')
      .select('brand, model, year, category, sub_category, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10000) // Keep limit reasonable for a single sitemap file

    if (bikes) {
      // Unique categories for category pages
      const categories = Array.from(new Set(bikes.map((b) => b.category)))
      
      for (const category of categories) {
        const categorySlug = formatCategoryForUrl(category)
        for (const lang of languages) {
          sitemapUrls.push({
            url: `${baseUrl}/${lang}/${categorySlug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          })
        }
      }

      // Bike detailed pages
      for (const bike of bikes) {
        for (const lang of languages) {
          // generateBikeUrl expects a Bike type, but we only have partial data here.
          // Because of TypeScript's strictness if generateBikeUrl requires the full Bike type, 
          // we cast it or just ensure generateBikeUrl only uses brand, model, year, category, sub_category.
          sitemapUrls.push({
            url: `${baseUrl}${generateBikeUrl(bike as any, lang)}`,
            lastModified: bike.updated_at ? new Date(bike.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemapUrls
}
