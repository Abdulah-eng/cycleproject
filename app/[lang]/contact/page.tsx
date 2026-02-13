import { Metadata } from 'next'
import { getMetadataAlternates } from '@/lib/utils'
import ContactForm from '@/components/ContactForm'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
    const alternates = getMetadataAlternates('/contact', params.lang)
    return {
        title: 'Contact Us - BikeMax',
        description: 'Get in touch with the BikeMax team for any inquiries or support.',
        alternates
    }
}

export default function ContactPage() {
    return <ContactForm />
}
