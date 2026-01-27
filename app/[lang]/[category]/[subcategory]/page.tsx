import { supabaseServer } from '@/lib/supabase'
import CategoryPageContent from '@/components/CategoryPageContent'
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

export default async function SubCategoryPage({ params }: PageProps) {
    const slug = params.subcategory
    const categorySlug = params.category.replace(/bikes$/i, '')

    // 1. Try matching as a sub_category first
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

    // 2. If no sub-category matches, try matching as a brand within this category
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
