import React from 'react'
import Link from 'next/link'
import { Button } from '../components/ui'

function Error({ statusCode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            {statusCode || 'Error'}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : 'An error occurred on client'
            }
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
