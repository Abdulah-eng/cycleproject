import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h2>
            <p className="mb-8 text-gray-600">Could not find the requested resource.</p>
            <Link
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                Return Home
            </Link>
        </div>
    )
}
