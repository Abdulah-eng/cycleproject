import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ComparisonProvider } from '@/context/ComparisonContext'
import { supabaseServer } from '@/lib/supabase'
import { formatCategoryForUrl } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'BikeMax - Premium Bicycle Catalog',
    description: 'Discover the perfect bike from our extensive catalog of road bikes, mountain bikes, and more.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

// Generate static params for languages
export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'de' }]
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { lang: string }
}) {
    // Fetch categories for footer
    const { data: categoriesData } = await supabaseServer
        .from('bikes')
        .select('category')
        .not('category', 'is', null)

    // Count bikes per category
    const categoryMap = new Map<string, number>()
    categoriesData?.forEach(item => {
        const count = categoryMap.get(item.category) || 0
        categoryMap.set(item.category, count + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        slug: formatCategoryForUrl(name),
        count
    }))

    return (
        <html lang={params.lang || 'en'} suppressHydrationWarning>
            <body className={inter.className}>
                <ComparisonProvider>
                    <Header />
                    {children}
                    <Footer categories={categories} />
                </ComparisonProvider>
            </body>
        </html>
    )
}
