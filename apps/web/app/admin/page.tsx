'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <UserButton />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Users</h3>
                  <p className="text-blue-700">Manage user accounts and permissions</p>
                  <Link href="/admin/users" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                    Manage Users
                  </Link>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Analytics</h3>
                  <p className="text-green-700">View application analytics and metrics</p>
                  <Link href="/admin/analytics" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                    View Analytics
                  </Link>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Settings</h3>
                  <p className="text-purple-700">Configure application settings</p>
                  <Link href="/admin/settings" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200">
                    Configure
                  </Link>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-900 mb-2">Order Sync</h3>
                  <p className="text-orange-700">Manage Stripe order synchronization</p>
                  <Link href="/admin/order-sync" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200">
                    Manage Sync
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
            </div>
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
                Please sign in to access the admin dashboard
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
