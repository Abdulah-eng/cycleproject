import { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase'
import CategoryPageContent from '@/components/CategoryPageContent'
import BikeDetailView from '@/components/BikeDetailView'
import Link from 'next/link'
import { generateUrlSlug, formatCategoryForUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: {
        lang: string
        category: string
        subcategory: string
    }
}

async function getBikeBySlug(slug: string) {
    const { data } = await supabaseServer
        .from('bikes')
        .select('*')
        .eq('slug', slug)
        .single()
    return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    // 1. Check if it's a bike
    const bike = await getBikeBySlug(params.subcategory)
    if (bike) {
        return {
            title: bike.title_seo || `${bike.brand} ${bike.model} ${bike.year || ''} - Specs & Review`,
            description: bike.meta_desc || bike.bike_desc?.substring(0, 160) || `Full specifications and review for ${bike.brand} ${bike.model}.`,
        }
    }

    // 2. Fallback to Subcategory/Brand metadata logic
    const displayName = params.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const categoryName = params.category.replace(/bikes$/i, ' Bikes').replace(/([A-Z])/g, ' $1').trim()

    return {
        title: `${displayName} - ${categoryName} | BikeMax`,
        description: `Explore our collection of ${displayName} ${categoryName}. Compare specs, prices, and reviews.`,
    }
}

export default async function SubCategoryPage({ params }: PageProps) {
    // 1. Try matching as a specific Bike (Product Page)
    const bike = await getBikeBySlug(params.subcategory)

    if (bike) {
        return <BikeDetailView bike={bike} lang={params.lang} />
    }

    // 2. If not a bike, proceed with Sub-Category / Brand logic
    const slug = params.subcategory
    const categorySlug = params.category.replace(/bikes$/i, '')

    // Try matching as a sub_category first
    const subCategoryName = slug.replace(/-/g, ' ')
    const { data: subCatBikes, count: subCatCount } = await supabaseServer
        .from('bikes')
        .select('id, brand, model, year, price, slug, category, sub_category, images, vfm_score_1_to_10, build_1_10, speed_index, frame', { count: 'exact' })
        .ilike('sub_category', `%${subCategoryName}%`)
        .ilike('category', `%${categorySlug}%`)
        .order('year', { ascending: false })

    let bikes = subCatBikes
    let totalCount = subCatCount || 0
    let type = 'subcategory'
    let displayName = subCategoryName

    // If no sub-category matches, try matching as a brand within this category
    if (!bikes || bikes.length === 0) {
        const brandName = slug.replace(/-/g, ' ')
        const { data: brandBikes, count: brandCount } = await supabaseServer
            .from('bikes')
            .select('id, brand, model, year, price, slug, category, sub_category, images, vfm_score_1_to_10, build_1_10, speed_index, frame', { count: 'exact' })
            .ilike('brand', brandName)
            .ilike('category', `%${categorySlug}%`)
            .order('year', { ascending: false })

        if (brandBikes && brandBikes.length > 0) {
            bikes = brandBikes
            totalCount = brandCount || 0
            type = 'brand'
            displayName = brandName
        }
    }

    const categoryDisplayName = params.category
        .replace(/bikes$/i, ' Bikes')
        .replace(/([A-Z])/g, ' $1')
        .trim()

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <Link href={`/${params.lang}/${params.category}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        ← Back to {categoryDisplayName}
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 capitalize">{displayName} {categoryDisplayName}</h1>
                    <p className="text-gray-600">
                        Browse {totalCount.toLocaleString()} {displayName.toLowerCase()} {categoryDisplayName.toLowerCase()} in our catalog
                    </p>
                </div>

                {bikes && bikes.length > 0 ? (
                    <CategoryPageContent
                        initialBikes={bikes}
                        categorySlug={params.category}
                        totalCount={totalCount}
                    />
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bikes Found</h3>
                        <p className="text-gray-600">We couldn't find any bikes matching "{displayName}" in this category.</p>
                    </div>
                )}
            </div>
        </main>
    )
}
