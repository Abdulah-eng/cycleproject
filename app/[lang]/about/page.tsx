export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">About BikeMax</h1>

            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6">
                    Welcome to BikeMax, your premier destination for high-quality bicycles.
                    Founded with a passion for cycling, we bring you an extensive collection of road bikes,
                    mountain bikes, e-bikes, and more from the world's leading brands.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Our Mission</h2>
                <p className="mb-6">
                    Our mission is to help every rider find their perfect bike. Whether you're a professional racer,
                    a daily commuter, or a weekend trail explorer, we provide the detailed information, comparisons,
                    and specifications you need to make an informed choice.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Expert Selection:</strong> Curated catalog of the best bikes in the market.</li>
                    <li><strong>Detailed Specs:</strong> Comprehensive technical specifications for every model.</li>
                    <li><strong>Unbiased Reviews:</strong> Honest scores and performance analysis.</li>
                    <li><strong>Global Reach:</strong> Serving cyclists worldwide with localized content.</li>
                </ul>

                <p>
                    Join our community of cycling enthusiasts and start your next adventure with BikeMax today.
                </p>
            </div>
        </div>
    )
}
