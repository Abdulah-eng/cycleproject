import { getDictionary } from '@/lib/dictionaries'
import SearchClient from './SearchClient'
import { Metadata } from 'next'
import { getMetadataAlternates } from '@/lib/utils'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const alternates = getMetadataAlternates('/search', params.lang)
    return {
        title: 'Search Bikes - BikeMax',
        description: 'Search our extensive catalog for your perfect bike.',
        alternates
    }
}

export default async function SearchPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)
    return <SearchClient dict={dict} lang={params.lang} />
}
