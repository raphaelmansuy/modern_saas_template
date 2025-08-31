'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

interface SyncStats {
  status: string
  isProvisional: boolean
  count: number
}

export default function OrderSyncPage() {
  const [syncStats, setSyncStats] = useState<SyncStats[]>([])
  const [syncResults, setSyncResults] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSyncStats()
  }, [])

  const fetchSyncStats = async () => {
    try {
      console.log('Fetching sync stats from frontend...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sync-stats`)
      
      console.log('Stats response status:', response.status)
      const data = await response.json()
      console.log('Stats response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      if (data.success) {
        setSyncStats(data.stats)
      } else {
        throw new Error(data.error || 'Failed to fetch sync stats')
      }
    } catch (error) {
      console.error('Error fetching sync stats:', error)
      // Don't show error to user for stats, just log it
    } finally {
      setLoading(false)
    }
  }

  const runManualSync = async () => {
    setIsSyncing(true)
    setSyncResults(null)

    try {
      console.log('Starting manual sync from frontend...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sync-orders`, {
        method: 'POST',
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      setSyncResults(data)

      // Refresh stats after sync
      await fetchSyncStats()
    } catch (error) {
      console.error('Error running manual sync:', error)
      setSyncResults({ error: error instanceof Error ? error.message : 'Failed to run sync' })
    } finally {
      setIsSyncing(false)
    }
  }

  const formatStatus = (status: string, isProvisional: boolean) => {
    if (isProvisional) return `${status} (Provisional)`
    return status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order sync dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Sync Management</h1>
                <p className="mt-2 text-gray-600">Monitor and manage Stripe order synchronization</p>
              </div>
              <UserButton />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {syncStats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stat.count}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {formatStatus(stat.status, stat.isProvisional)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Manual Sync</h2>
              <p className="text-gray-600 mb-4">
                Manually trigger synchronization of pending orders with Stripe.
                This will process provisional orders and update their status.
              </p>

              <button
                onClick={runManualSync}
                disabled={isSyncing}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Syncing Orders...
                  </>
                ) : (
                  'Run Manual Sync'
                )}
              </button>

              {syncResults && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Sync Results:</h3>
                  {syncResults.error ? (
                    <p className="text-red-600">{syncResults.error}</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>Synced: {syncResults.synced}</p>
                      <p>Failed: {syncResults.failed}</p>
                      <p>Skipped: {syncResults.skipped}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Background Sync</h2>
              <p className="text-gray-600 mb-4">
                The background sync service runs automatically every 5 minutes to process pending orders.
                You can also run it manually using the button above.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Cron Job Setup</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  To set up automatic background sync, add this to your crontab:
                </p>
                <code className="block bg-yellow-100 p-2 rounded text-sm font-mono">
                  */5 * * * * cd /path/to/your/app && bun run sync-orders
                </code>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Manual Sync Commands</h3>
                <p className="text-sm text-blue-700 mb-2">
                  You can also run the sync manually from the command line:
                </p>
                <div className="space-y-2">
                  <code className="block bg-blue-100 p-2 rounded text-sm font-mono">
                    bun run sync-orders
                  </code>
                  <code className="block bg-blue-100 p-2 rounded text-sm font-mono">
                    docker-compose exec api bun run sync-orders
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Admin Access Required
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please sign in to access the order sync management
              </p>
            </div>
            <div className="text-center">
              <SignInButton mode="modal">
                <button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Sign In
                </button>
              </SignInButton>
            </div>
            <div className="text-center">
              <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}
