import ComparisonTable from '@/components/ComparisonTable'
import { Metadata } from 'next'
import { getDictionary } from '@/lib/dictionaries'

import { getMetadataAlternates } from '@/lib/utils'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const alternates = getMetadataAlternates('/compare', params.lang)
    return {
        title: 'Compare Bikes - MatchBikes',
        description: 'Compare full specifications and scores of your selected bikes.',
        alternates
    }
}

export default async function ComparePage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)

    return (
        <main className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.compare_page.title}</h1>
                <p className="text-gray-600 mb-8">{dict.compare_page.subtitle}</p>
                <ComparisonTable dict={dict} lang={params.lang} />
            </div>
        </main>
    )
}
