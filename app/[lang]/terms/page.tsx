export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms of Service</h1>

            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <p className="mb-6">
                    Please read these Terms of Service carefully before using the BikeMax website.
                    By accessing or using our service, you agree to be bound by these terms.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">1. Acceptance of Terms</h2>
                <p className="mb-6">
                    By accessing this website, you agree to be bound by these website Terms and Conditions of Use,
                    all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">2. Use License</h2>
                <p className="mb-4">
                    Permission is granted to temporarily download one copy of the materials (information or software) on BikeMax's website
                    for personal, non-commercial transitory viewing only.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">3. Disclaimer</h2>
                <p className="mb-6">
                    The materials on BikeMax's website are provided "as is". BikeMax makes no warranties, expressed or implied,
                    and hereby disclaims and negates all other warranties, including without limitation, implied warranties or
                    conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">4. Limitations</h2>
                <p className="mb-6">
                    In no event shall BikeMax or its suppliers be liable for any damages (including, without limitation, damages for loss
                    of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BikeMax's website.
                </p>
            </div>
        </div>
    )
}
