import Link from 'next/link'

export default function Home({ params }: { params: { lang: string } }) {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="bg-blue-600 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">Find Your Perfect Ride</h1>
                    <p className="text-xl mb-8 text-blue-100">Browse our extensive collection of premium bicycles.</p>
                    <div className="flex justify-center gap-4">
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
                    {['Road', 'Mountain', 'E-Bike'].map((cat) => (
                        <Link
                            key={cat}
                            href={`/${params.lang}/${cat.toLowerCase().replace('-', '')}bikes`}
                            className="block group"
                        >
                            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-xl">
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 font-bold text-xl">{cat}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">{cat} Bikes</h3>
                                    <p className="text-gray-600">Explore our selection of {cat.toLowerCase()} bikes.</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
