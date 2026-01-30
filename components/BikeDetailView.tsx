import { Bike, BikeMetrics } from '@/lib/supabase'
import ImageGallery from './ImageGallery'
import InteractiveScoreSummary from './InteractiveScoreSummary'
import SpecsTable from './SpecsTable'
import Link from 'next/link'

interface BikeDetailViewProps {
    bike: Bike
    lang: string
}

export default function BikeDetailView({ bike, lang }: BikeDetailViewProps) {
    // Construct metrics object for InteractiveScoreSummary
    // Using the new score columns as requested
    const metrics: any = {
        performance: {
            label: 'Performance',
            score: bike.performance_score || 0,
            maxScore: 10,
            description: 'Overall performance rating based on speed, handling, and efficiency.'
        },
        value: {
            label: 'Value',
            score: bike.value_score || 0,
            maxScore: 10,
            description: 'Value for money assessment compared to similar bikes.'
        },
        fit: {
            label: 'Fit & Comfort',
            score: bike.fit_score || 0,
            maxScore: 10,
            description: 'Assessment of riding position, adjustability, and comfort.'
        },
        general: {
            label: 'Overall',
            score: bike.general_score || bike.overall_score || 0,
            maxScore: 10,
            description: 'General assessment of the bike.'
        }
    }

    // Construct JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `https://cycleproject.vercel.app/${lang}/${bike.category.toLowerCase().replace(/\s+/g, '')}/${bike.sub_category?.toLowerCase().replace(/\s+/g, '-')}/${bike.slug}#product`,
        'name': `${bike.brand} ${bike.model} ${bike.year || ''}`,
        'brand': {
            '@type': 'Brand',
            'name': bike.brand
        },
        'image': bike.images || [],
        'description': bike.bike_desc || bike.meta_desc || `${bike.brand} ${bike.model}`,
        'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'EUR', // Assuming EUR based on user input, or USD? Codebase usually has generic price. User sample said EUR.
            'lowPrice': bike.price?.toString(),
            'highPrice': bike.price?.toString(), // If we had range, we'd use it. For single price, low=high.
            'offerCount': 1 // We represent one aggregate view
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Inject Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${lang}/${bike.category.toLowerCase().replace(/\s+/g, '')}bikes`} className="hover:text-blue-600 capitalize">
                            {bike.category}
                        </Link>
                        {bike.sub_category && (
                            <>
                                <span className="mx-2">/</span>
                                <Link href={`/${lang}/${bike.category.toLowerCase().replace(/\s+/g, '')}/${bike.sub_category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-600 capitalize">
                                    {bike.sub_category}
                                </Link>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium truncate">{bike.brand} {bike.model}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left Column: Images */}
                    <div>
                        <ImageGallery images={bike.images || []} alt={`${bike.brand} ${bike.model}`} />
                    </div>

                    {/* Right Column: Details */}
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">{bike.brand} {bike.model} {bike.year}</h1>
                        <div className="flex items-baseline gap-4 mb-6">
                            {bike.price && (
                                <span className="text-2xl font-bold text-blue-600">
                                    ${bike.price.toLocaleString()}
                                </span>
                            )}
                            {/* Add more generic meta info here if needed */}
                        </div>

                        {/* Description */}
                        <div className="prose prose-lg text-gray-600 mb-8">
                            <p>{bike.bike_desc}</p>
                        </div>

                        {/* Scores */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <InteractiveScoreSummary metrics={metrics} bike={bike} />
                        </div>

                        {/* External Link if exists */}
                        {bike.url && (
                            <a
                                href={bike.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View on Manufacturer Site
                            </a>
                        )}
                    </div>
                </div>

                {/* Specs Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Technical Specifications</h2>
                    <SpecsTable bike={bike} />
                </div>
            </div>
        </div>
    )
}
