import ComparisonTable from '@/components/ComparisonTable'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Compare Bikes - BikeMax',
    description: 'Compare full specifications and scores of your selected bikes.'
}

export default function ComparePage() {
    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Bikes</h1>
                <p className="text-gray-600 mb-8">Compare up to 4 bikes side-by-side to find your perfect ride.</p>
                <ComparisonTable />
            </div>
        </main>
    )
}
