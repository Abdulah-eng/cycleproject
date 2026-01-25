import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Header from '@/components/Header'
import { ComparisonProvider } from '@/context/ComparisonContext'

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

export default function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { lang: string }
}) {
    return (
        <html lang={params.lang || 'en'}>
            <body className={inter.className}>
                <ComparisonProvider>
                    <Header />
                    {children}
                </ComparisonProvider>
            </body>
        </html>
    )
}
