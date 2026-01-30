export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Cookie Policy</h1>

            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6">
                    This Cookie Policy explains how BikeMax uses cookies and similar technologies to recognize you when you visit our website.
                    It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">What are cookies?</h2>
                <p className="mb-6">
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                    Cookies are widely used by website owners in order to make their websites work, or to work more efficiently,
                    as well as to provide reporting information.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Why do we use cookies?</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website.</li>
                    <li><strong>Preference Cookies:</strong> Enable the website to remember information that changes the way the website behaves or looks (like your preferred language).</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">How to control cookies</h2>
                <p className="mb-6">
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your
                    browser controls to accept or refuse cookies.
                </p>
            </div>
        </div>
    )
}
