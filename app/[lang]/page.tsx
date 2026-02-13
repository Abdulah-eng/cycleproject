import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'
import { generateUrlSlug, formatCategoryForUrl, generateBikeUrl } from '@/lib/utils'
import SubCategoryCarousel from '@/components/SubCategoryCarousel'

export const dynamic = 'force-dynamic'

// Helper to format category names for display
const formatDisplayName = (name: string) => {
    if (!name) return ''
    if (name === 'E-bikeRoad') return 'Road E-Bikes'
    if (name === 'E-bikeMountain') return 'Mountain E-Bikes'
    return name.replace(/([A-Z])/g, ' $1').trim()
}

async function getAllCategories() {
    try {
        // 1. Get distinct categories
        const { data: allBikes } = await supabaseServer
            .from('bikes')
            .select('category')
            .not('category', 'is', null)

        if (!allBikes) return []

        const uniqueCategories = Array.from(new Set(allBikes.map(b => b.category))).sort()

        // 2. Fetch image for each
        const results = await Promise.all(uniqueCategories.map(async (cat) => {
            const { data } = await supabaseServer
                .from('bikes')
                .select('images')
                .eq('category', cat)
                .not('images', 'is', null)
                .limit(1)

            const image = (data && data.length > 0 && data[0].images?.[0]) || '/category-road.png'

            return {
                name: cat, // DB name
                displayName: formatDisplayName(cat),
                slug: `${formatCategoryForUrl(cat)}bikes`, // e.g. e-bikeroadbikes
                image
            }
        }))

        // Optional: Add 'View All' if you still want it, or strictly stick to DB. 
        // User asked for "all categories present in db", so I will stick to that predominantly.
        // But for UX, a "View All" is usually good. I'll append it.
        results.push({
            name: 'View All',
            displayName: 'Browse All Bikes',
            slug: 'search',
            image: '/category-ebike.png'
        })

        return results
    } catch (e) {
        console.error("Error in getAllCategories", e)
        return []
    }
}

async function getAllSubCategories() {
    try {
        // 1. Get distinct subcategories
        const { data: allBikes } = await supabaseServer
            .from('bikes')
            .select('sub_category, category') // Get category too for linking
            .not('sub_category', 'is', null)

        if (!allBikes) return []

        // Create a map to keep track of one category parent for each subcat (mostly 1:1, but just in case)
        const subCatMap = new Map<string, string>()
        allBikes.forEach(b => {
            if (b.sub_category) subCatMap.set(b.sub_category, b.category)
        })

        const uniqueSubCategories = Array.from(subCatMap.keys()).sort()

        // 2. Fetch image for each
        const results = await Promise.all(uniqueSubCategories.map(async (sub) => {
            const { data } = await supabaseServer
                .from('bikes')
                .select('images')
                .eq('sub_category', sub)
                .not('images', 'is', null)
                .limit(1)

            const image = (data && data.length > 0 && data[0].images?.[0]) || '/enduro.png'
            const parentCat = subCatMap.get(sub) || 'road'

            return {
                name: sub,
                displayName: formatDisplayName(sub),
                category: parentCat,
                slug: generateUrlSlug(sub),
                image
            }
        }))

        return results
    } catch (e) {
        console.error("Error in getAllSubCategories", e)
        return []
    }
}

async function getBrandData() {
    const brands = [
        { name: 'Specialized', image: '/logo/specialized.png', slug: 'specialized' },
        { name: 'Trek', image: '/logo/trek.jpg', slug: 'trek' },
        { name: 'Giant', image: '/logo/giant.png', slug: 'giant' },
        { name: 'Canyon', image: '/logo/Canyon_Bicycles-Logo.wine.svg', slug: 'canyon' },
        { name: 'Santa Cruz', image: '/logo/santa.png', slug: 'santa-cruz' },
    ]
    return brands
}

async function getLatestBikes() {
    try {
        const { data } = await supabaseServer
            .from('bikes')
            .select('id, brand, model, year, images, slug, category, sub_category, price')
            .order('created_at', { ascending: false })
            .limit(4)
        return data || []
    } catch (e) {
        return []
    }
}

async function getTopRatedBikes() {
    try {
        const { data } = await supabaseServer
            .from('bikes')
            .select('id, brand, model, year, images, slug, category, sub_category, overall_score')
            .not('overall_score', 'is', null)
            .order('overall_score', { ascending: false })
            .limit(4)
        return data || []
    } catch (e) {
        return []
    }
}

import { getDictionary } from '@/lib/dictionaries'

// ... existing imports

import { Metadata } from 'next'
import { getMetadataAlternates } from '@/lib/utils'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const alternates = getMetadataAlternates('', params.lang)
    return {
        alternates
    }
}

export default async function Home({ params }: { params: { lang: string } }) {
    const categories = await getAllCategories()
    const subCategories = await getAllSubCategories()
    const brands = await getBrandData()
    const latestBikes = await getLatestBikes()
    const topRatedBikes = await getTopRatedBikes()
    const dict = await getDictionary(params.lang)

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section with Glassmorphism */}
            <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/hero.png"
                    alt="Biking hero"
                    fill
                    className="object-cover scale-105 animate-subtle-zoom"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

                <div className="container mx-auto px-4 text-center relative z-10 pt-24 pb-20 md:py-0">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md">
                        <span className="text-blue-200 text-sm font-bold tracking-widest uppercase">{dict.home.future_cycling}</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-none">
                        {dict.home.hero_title_1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{dict.home.hero_title_2}</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                        {dict.home.hero_subtitle}
                    </p>
                    <div className="flex justify-center gap-4 md:gap-6 flex-wrap w-full max-w-4xl mx-auto">
                        <Link href={`/${params.lang}/roadbikes`} className="group bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center text-sm md:text-base min-w-[140px] md:min-w-[160px]">
                            {dict.home.road_bikes}
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                        <Link href={`/${params.lang}/mountainbikes`} className="group bg-emerald-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center text-sm md:text-base min-w-[140px] md:min-w-[160px]">
                            {dict.home.mountain_bikes}
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                        <Link href={`/${params.lang}/e-bikeroadbikes`} className="group bg-indigo-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center text-sm md:text-base min-w-[140px] md:min-w-[160px]">
                            {dict.home.e_road}
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </Link>
                        <Link href={`/${params.lang}/e-bikemountainbikes`} className="group bg-teal-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-teal-700 transition-all shadow-lg flex items-center justify-center text-sm md:text-base min-w-[140px] md:min-w-[160px]">
                            {dict.home.e_mountain}
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Remove negative margin to prevent overlap */}
            <div className="container mx-auto px-4 relative z-20 pb-24 pt-12">
                {/* Browse by Category */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{dict.home.browse_category}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.map((cat, idx) => (
                            <Link
                                key={cat.name}
                                href={`/${params.lang}/${cat.slug}`}
                                className={`group relative h-96 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-4 font-normal`}
                            >
                                <Image
                                    src={cat.image}
                                    alt={cat.displayName}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute inset-x-0 bottom-0 p-8">
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-2">{cat.displayName}</h3>
                                        <span className="text-blue-400 font-bold flex items-center gap-2">
                                            {dict.home.explore_collection}
                                            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Browse by Sub-Category */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{dict.home.browse_subcategory}</h2>
                    </div>

                    <SubCategoryCarousel subCategories={subCategories} lang={params.lang} />
                </div>

                {/* Road Bike Collections */}
                <div className="mb-20">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{dict.home.road_collections}</h2>
                            <p className="text-gray-500">{dict.home.road_desc}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Top Rated Road', slug: 'top-road-bikes', img: '/category-road.png' },
                            { name: 'Best Value Road', slug: 'top-value-road-bikes', img: '/gravel.png' },
                            { name: 'Top Performance', slug: 'top-performance', img: '/aero.png' }
                        ].map((col) => (
                            <Link
                                key={col.name}
                                href={`/${params.lang}/e-bikeroadbikes/${col.slug}`}
                                className="group relative h-56 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                            >
                                <Image src={col.img} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">{col.name}</h3>
                                    <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">{dict.home.view_collection}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mountain Bike Collections */}
                <div className="mb-32">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{dict.home.mountain_collections}</h2>
                            <p className="text-gray-500">{dict.home.mountain_desc}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Top Rated MTB', slug: 'top-mountain-bikes', img: '/category-mountain.png' },
                            { name: 'Best Value MTB', slug: 'top-value-mountain-bikes', img: '/enduro.png' },
                            { name: 'Trail Blazers', slug: 'top-performance', img: '/trail.png' }
                        ].map((col) => (
                            <Link
                                key={col.name}
                                href={`/${params.lang}/e-bikemountainbikes/${col.slug}`}
                                className="group relative h-56 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                            >
                                <Image src={col.img} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">{col.name}</h3>
                                    <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">{dict.home.view_collection}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Latest Arrivals */}
                {latestBikes.length > 0 && (
                    <div className="mb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{dict.home.latest_arrivals}</h2>
                                <p className="text-gray-500">{dict.home.latest_desc}</p>
                            </div>
                            <Link href={`/${params.lang}/search`} className="text-blue-600 font-bold hover:text-blue-800">
                                {dict.home.view_all_new} →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {latestBikes.map(bike => (
                                <Link
                                    key={bike.id}
                                    href={generateBikeUrl(bike, params.lang)}
                                    className="group block"
                                >
                                    <div className="bg-gray-100 rounded-2xl aspect-[4/3] relative overflow-hidden mb-4">
                                        {bike.images?.[0] ? (
                                            <Image src={bike.images[0]} alt={bike.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        {bike.price && (
                                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                                                ${bike.price.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{bike.brand} {bike.model}</h3>
                                    <p className="text-gray-500">{bike.year}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Brands */}
                <div className="mb-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{dict.home.top_brands.split(' ').slice(0, 2).join(' ')} <br />{dict.home.top_brands.split(' ').slice(2).join(' ')}</h2>
                            <p className="text-gray-500 text-lg">{dict.home.brands_desc}</p>
                        </div>
                        <Link href={`/${params.lang}/search`} className="text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
                            {dict.home.view_manufacturers}
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {brands.map((brand, i) => (
                            <Link
                                key={brand.name}
                                href={`/${params.lang}/${brand.slug}`}
                                className="group relative bg-white border border-gray-100 p-8 rounded-2xl flex flex-col items-center justify-center hover:shadow-xl hover:border-blue-100 transition-all duration-300 h-48"
                            >
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </div>

                                <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <Image
                                        src={brand.image}
                                        alt={brand.name}
                                        fill
                                        className={`object-contain ${brand.name === 'Canyon' || brand.name === 'Santa Cruz' ? 'px-2' : 'p-4'}`}
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                    />
                                </div>
                                <span className="sr-only">{brand.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Top Rated Section */}
                {topRatedBikes.length > 0 && (
                    <div>
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{dict.home.top_rated}</h2>
                            <p className="text-gray-500">{dict.home.top_rated_desc}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {topRatedBikes.map(bike => (
                                <Link
                                    key={bike.id}
                                    href={generateBikeUrl(bike, params.lang)}
                                    className="group block"
                                >
                                    <div className="bg-gray-100 rounded-2xl aspect-[4/3] relative overflow-hidden mb-4">
                                        {bike.images?.[0] ? (
                                            <Image src={bike.images[0]} alt={bike.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-md">
                                            {bike.overall_score}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{bike.brand} {bike.model}</h3>
                                    <p className="text-gray-500">{bike.category}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
