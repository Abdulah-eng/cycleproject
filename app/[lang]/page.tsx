import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'
import { generateUrlSlug, formatCategoryForUrl } from '@/lib/utils'

async function getCategoryImages() {
    const categories = [
        { name: 'Road', pattern: 'Road', fallback: '/category-road.png' },
        { name: 'Mountain', pattern: 'Mountain', fallback: '/category-mountain.png' },
        { name: 'E-Bike', pattern: 'E-bike', fallback: '/category-ebike.png' }
    ]

    const results = await Promise.all(categories.map(async (cat) => {
        const { data } = await supabaseServer
            .from('bikes')
            .select('images, brand, model')
            .ilike('category', `%${cat.pattern}%`)
            .not('images', 'is', null)
            .limit(1)

        const dbImage = data && data.length > 0 ? data[0].images?.[0] : null

        return {
            name: cat.name,
            image: dbImage || cat.fallback,
            alt: data && data.length > 0 ? `${data[0].brand} ${data[0].model}` : cat.name
        }
    }))

    return results
}

async function getSubCategoryData() {
    const subCats = [
        { name: 'Enduro', category: 'E-bikeMountain', image: '/enduro.png' },
        { name: 'Trail', category: 'E-bikeMountain', image: '/trail.png' },
        { name: 'Gravel', category: 'Road', image: '/gravel.png' },
        { name: 'Aero', category: 'Road', image: '/aero.png' }
    ]

    const results = await Promise.all(subCats.map(async (sc) => {
        const { data } = await supabaseServer
            .from('bikes')
            .select('images, brand, model')
            .ilike('sub_category', `%${sc.name}%`)
            .not('images', 'is', null)
            .limit(1)

        // Use our high-quality generated images as the primary for these categories
        return {
            ...sc,
            alt: data && data.length > 0 ? `${data[0].brand} ${data[0].model}` : sc.name
        }
    }))
    return results
}

async function getBrandData() {
    const brands = ['Specialized', 'Trek', 'Giant', 'Canyon', 'Santa Cruz']
    const results = await Promise.all(brands.map(async (brand) => {
        const { data } = await supabaseServer
            .from('bikes')
            .select('images')
            .ilike('brand', brand)
            .not('images', 'is', null)
            .limit(1)
        return {
            name: brand,
            image: data && data.length > 0 ? data[0].images?.[0] : null
        }
    }))
    return results
}

export default async function Home({ params }: { params: { lang: string } }) {
    const [categoryImages, subCategories, brands] = await Promise.all([
        getCategoryImages(),
        getSubCategoryData(),
        getBrandData()
    ])

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section with Glassmorphism */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/hero.png"
                    alt="Biking hero"
                    fill
                    className="object-cover scale-105 animate-subtle-zoom"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md">
                        <span className="text-blue-200 text-sm font-bold tracking-widest uppercase">The Future of Cycling</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-none">
                        ULTIMATE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">BIKE DATABASE</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                        Data-driven insights, Expert analysis, and the most comprehensive bike comparisons on the planet.
                    </p>
                    <div className="flex justify-center gap-6 flex-wrap">
                        <Link href={`/${params.lang}/e-bikeroadbikes`} className="group bg-blue-600 text-white px-12 py-5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)] flex items-center">
                            Road E-Bikes
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                        <Link href={`/${params.lang}/e-bikemountainbikes`} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold hover:bg-white/20 transition-all shadow-xl">
                            Mountain E-Bikes
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20 pb-24">
                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categoryImages.map((cat, idx) => (
                        <Link
                            key={cat.name}
                            href={`/${params.lang}/${cat.name.toLowerCase().replace('-', '')}bikes`}
                            className={`group relative h-96 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-4 ${idx === 1 ? 'md:-translate-y-8' : ''}`}
                        >
                            <Image
                                src={cat.image}
                                alt={cat.alt}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <div className="w-12 h-1 bg-blue-500 mb-4 rounded-full group-hover:w-20 transition-all duration-500"></div>
                                <h3 className="text-4xl font-black mb-2 tracking-tight">{cat.name}</h3>
                                <span className="inline-flex items-center text-sm font-bold text-blue-400 group-hover:text-blue-300 tracking-wider uppercase">
                                    Explore collection
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Sub-Category Highlights */}
                <div className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4">ENGINEERED FOR EXCELLENCE</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Browse specialized categories tailored for specific terrain and riding styles.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {subCategories.map((sc) => (
                            <Link
                                key={sc.name}
                                href={`/${params.lang}/${formatCategoryForUrl(sc.category)}/${generateUrlSlug(sc.name)}`}
                                className="group relative h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                            >
                                <Image
                                    src={sc.image}
                                    alt={sc.alt}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-blue-900/20 transition-colors"></div>
                                <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                                        <h3 className="text-2xl font-bold text-white tracking-wide uppercase text-center">{sc.name}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Featured Brands */}
                <div className="mt-40">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">TOP TIER <br />BRANDS</h2>
                            <p className="text-gray-500 text-lg">Leading innovators in the cycling industry.</p>
                        </div>
                        <Link href={`/${params.lang}/search`} className="text-blue-600 font-bold flex items-center hover:text-blue-800 transition-colors">
                            View all manufacturers
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                        {brands.map((brand) => (
                            <Link
                                key={brand.name}
                                href={`/${params.lang}/${generateUrlSlug(brand.name)}`}
                                className="group bg-gray-50 p-10 rounded-3xl flex flex-col items-center justify-center hover:bg-white hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-transparent hover:border-gray-100"
                            >
                                <div className="relative w-full aspect-[3/2] mb-6 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                                    {brand.image && <Image src={brand.image} alt={brand.name} fill className="object-contain" />}
                                </div>
                                <span className="text-xl font-black text-slate-400 group-hover:text-slate-900 bg-slate-200 group-hover:bg-blue-100 px-4 py-1 rounded-lg transition-all">{brand.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
