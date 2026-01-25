import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase'

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

export default async function Home({ params }: { params: { lang: string } }) {
    const categoryImages = await getCategoryImages()

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="bg-blue-600 text-white py-20 relative overflow-hidden">
                {/* Background Pattern or Image could go here */}
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl font-bold mb-6">Find Your Perfect Ride</h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">Browse our extensive collection of premium bicycles, compare specifications, and find the best value for your budget.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href={`/${params.lang}/roadbikes`} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                            Road Bikes
                        </Link>
                        <Link href={`/${params.lang}/mountainbikes`} className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                            Mountain Bikes
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categoryImages.map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/${params.lang}/${cat.name.toLowerCase().replace('-', '')}bikes`}
                            className="block group h-full"
                        >
                            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                                <div className="relative h-64 bg-gray-200">
                                    {cat.image ? (
                                        <Image
                                            src={cat.image}
                                            alt={cat.alt}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <span className="text-xl font-bold">{cat.name}</span>
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{cat.name}</h3>
                                        <p className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">View Collection &rarr;</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
