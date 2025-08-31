import Link from 'next/link'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button size="lg">
              Go Home
            </Button>
          </Link>
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
