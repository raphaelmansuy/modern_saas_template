'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui'
import { BreadcrumbItem } from '../../lib/store/navigation'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin' }
]

export default function AdminPage() {
  return (
    <PageLayout
      title="Admin Dashboard"
      description="Manage users, analytics, and system settings"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center space-x-4">
          <UserButton />
        </div>
      }
    >
      <SignedIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Users</h3>
            <p className="text-blue-700 mb-4">Manage user accounts and permissions</p>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Manage Users
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Analytics</h3>
            <p className="text-green-700 mb-4">View application analytics and metrics</p>
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Settings</h3>
            <p className="text-purple-700 mb-4">Configure application settings</p>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Order Sync</h3>
            <p className="text-orange-700 mb-4">Manage Stripe order synchronization</p>
            <Link href="/admin/order-sync">
              <Button variant="outline" size="sm">
                Manage Sync
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex space-x-4">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← Back to Home
            </Link>
            <Link href="/dashboard" className="text-green-600 hover:text-green-500">
              User Dashboard
            </Link>
            <Link href="/profile" className="text-blue-600 hover:text-blue-500">
              My Profile
            </Link>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the admin dashboard
            </p>
            <SignInButton mode="modal">
              <Button>
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </PageLayout>
  )
}
