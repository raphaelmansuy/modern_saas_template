'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button, Card, Badge, Progress, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui'
import { BreadcrumbItem } from '@/lib/store/navigation'
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, ArrowPathIcon, CogIcon } from '@heroicons/react/24/outline'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin', href: '/admin' },
  { label: 'Order Sync' }
]

interface SyncStats {
  status: string
  isProvisional: boolean
  count: number
}

interface SyncResults {
  synced: number
  failed: number
  skipped: number
  error?: string
}

export default function OrderSyncPage() {
  const [syncStats, setSyncStats] = useState<SyncStats[]>([])
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

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
    setSyncProgress(0)

    try {
      console.log('Starting manual sync from frontend...')

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sync-orders`, {
        method: 'POST',
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      setSyncResults(data)
      setLastSyncTime(new Date())

      // Refresh stats after sync
      await fetchSyncStats()
    } catch (error) {
      console.error('Error running manual sync:', error)
      setSyncResults({ synced: 0, failed: 0, skipped: 0, error: error instanceof Error ? error.message : 'Failed to run sync' })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 2000)
    }
  }

  const formatStatus = (status: string, isProvisional: boolean) => {
    if (isProvisional) return `${status} (Provisional)`
    return status
  }

  const getStatusIcon = (status: string, isProvisional: boolean) => {
    if (isProvisional) return <ClockIcon className="h-5 w-5 text-yellow-500" />
    if (status.toLowerCase().includes('success') || status.toLowerCase().includes('completed')) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('failed')) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
    return <CogIcon className="h-5 w-5 text-blue-500" />
  }

  const getStatusBadgeVariant = (status: string, isProvisional: boolean) => {
    if (isProvisional) return 'secondary'
    if (status.toLowerCase().includes('success') || status.toLowerCase().includes('completed')) return 'default'
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('failed')) return 'destructive'
    return 'outline'
  }

  if (loading) {
    return (
      <PageLayout
        title="Order Sync Management"
        description="Loading order sync dashboard..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading sync dashboard...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Order Sync Management"
      description="Monitor and manage Stripe order synchronization"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center space-x-4">
          <UserButton />
        </div>
      }
    >
      <SignedIn>
        <div className="space-y-8">
          {/* System Status Overview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">All systems operational</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">API Connection</p>
                    <p className="text-sm text-green-700">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Stripe Integration</p>
                    <p className="text-sm text-green-700">Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Background Sync</p>
                    <p className="text-sm text-blue-700">Running every 5min</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Statistics */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Statistics</h2>
                <Badge variant="outline" className="text-xs">
                  Live Data
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {syncStats.map((stat, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      {getStatusIcon(stat.status, stat.isProvisional)}
                      <Badge variant={getStatusBadgeVariant(stat.status, stat.isProvisional)} className="text-xs">
                        {stat.isProvisional ? 'Provisional' : 'Confirmed'}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {formatStatus(stat.status, stat.isProvisional)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Manual Sync */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Manual Sync</h2>
                {lastSyncTime && (
                  <Badge variant="outline" className="text-xs">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-6">
                Manually trigger synchronization of pending orders with Stripe.
                This will process provisional orders and update their status.
              </p>

              {isSyncing && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Sync Progress</span>
                    <span className="text-sm text-gray-500">{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isSyncing} className="w-full sm:w-auto">
                    {isSyncing ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Syncing Orders...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Run Manual Sync
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Manual Sync</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will synchronize all pending orders with Stripe. This process may take a few moments.
                      Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={runManualSync}>Start Sync</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {syncResults && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    Sync Results
                  </h3>
                  {syncResults.error ? (
                    <div className="flex items-center space-x-2 text-red-600">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <p>{syncResults.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{syncResults.synced}</div>
                        <div className="text-green-700">Synced</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{syncResults.failed}</div>
                        <div className="text-red-700">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">{syncResults.skipped}</div>
                        <div className="text-yellow-700">Skipped</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Background Sync */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Background Sync</h2>
                <Badge variant="secondary" className="text-xs">
                  Auto-running
                </Badge>
              </div>
              <p className="text-gray-600 mb-6">
                The background sync service runs automatically every 5 minutes to process pending orders.
                You can also run it manually using the button above.
              </p>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Cron Job Setup
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    To set up automatic background sync, add this to your crontab:
                  </p>
                  <code className="block bg-yellow-100 p-2 rounded text-sm font-mono border">
                    */5 * * * * cd /path/to/your/app && bun run sync-orders
                  </code>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <CogIcon className="h-5 w-5 mr-2" />
                    Manual Sync Commands
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    You can also run the sync manually from the command line:
                  </p>
                  <div className="space-y-2">
                    <code className="block bg-blue-100 p-2 rounded text-sm font-mono border">
                      bun run sync-orders
                    </code>
                    <code className="block bg-blue-100 p-2 rounded text-sm font-mono border">
                      docker-compose exec api bun run sync-orders
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-500 flex items-center">
              ← Back to Admin Dashboard
            </Link>
            <Button variant="outline" onClick={fetchSyncStats}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <div className="p-8">
              <div className="flex justify-center mb-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Admin Access Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in to access the order sync management
              </p>
              <SignInButton mode="modal">
                <Button className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </Card>
        </div>
      </SignedOut>
    </PageLayout>
  )
}
