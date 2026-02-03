import { getDictionary } from '@/lib/dictionaries'
import SearchClient from './SearchClient'

export default async function SearchPage({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang)
    return <SearchClient dict={dict} lang={params.lang} />
}
