'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui'
import { Card, CardContent } from '../components/ui'
import { ExclamationTriangleIcon, HomeIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="mb-8">
                <ExclamationTriangleIcon className="mx-auto h-20 w-20 text-red-500 mb-6" />
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  We're sorry, but something unexpected happened while processing your request.
                </p>
                <p className="text-gray-500 mb-8">
                  Don't worry, our team has been notified and is working to fix this issue.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-8">
                  <details className="bg-gray-50 p-4 rounded-lg text-left">
                    <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <pre className="text-sm text-red-600 whitespace-pre-wrap overflow-auto">
                      {error.message}
                    </pre>
                    {error.stack && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto mt-2">
                        {error.stack}
                      </pre>
                    )}
                  </details>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={reset} size="lg" className="flex items-center space-x-2">
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Try Again</span>
                  </Button>
                  <Link href="/">
                    <Button variant="outline" size="lg" className="flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5" />
                      <span>Go Home</span>
                    </Button>
                  </Link>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">
                    Still having issues? Here are some things you can try:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Refresh the page</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Clear your browser cache</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Try a different browser</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Contact our support team</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-6">
                    <Link
                      href="/dashboard"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Profile
                    </Link>
                    <a
                      href="mailto:support@example.com"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Support</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
