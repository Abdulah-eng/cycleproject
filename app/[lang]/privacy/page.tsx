export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <p className="mb-6">
                    At BikeMax, we respect your privacy and are committed to protecting the personal information you share with us.
                    This Privacy Policy explains how we collect, use, and safeguard your information.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Information We Collect</h2>
                <p className="mb-4">
                    We may collect personal information such as your name, email address, and browsing behavior when you use our website.
                    We also automatically collect certain information about your device and usage patterns to improve our services.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>To provide and maintain our website functionality.</li>
                    <li>To personalize your experience and improved our bike catalog.</li>
                    <li>To communicate with you regarding updates, offers, or inquiries.</li>
                    <li>To analyze usage trends and optimize website performance.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Data Security</h2>
                <p className="mb-6">
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access,
                    alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at privacy@bikemax.com.
                </p>
            </div>
        </div>
    )
}
