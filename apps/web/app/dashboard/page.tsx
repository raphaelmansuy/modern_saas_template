'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'
import { useToast } from '../../components/Toast'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui'
import { BreadcrumbItem } from '../../lib/store/navigation'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard' }
]

export default function Dashboard() {
  const { addToast } = useToast()

  useEffect(() => {
    // Show welcome message when user first arrives at dashboard
    const timer = setTimeout(() => {
      addToast('Welcome back! You have successfully signed in.', 'success')
    }, 500)

    return () => clearTimeout(timer)
  }, [addToast])

  return (
    <PageLayout
      title="Dashboard"
      description="Welcome to your SaaS dashboard. Manage your account and explore available features."
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center space-x-4">
          <UserButton />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Products</h3>
            <p className="text-blue-700 mb-4">Browse and manage your products</p>
            <Link href="/products">
              <Button variant="outline" size="sm">
                View Products
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Profile</h3>
            <p className="text-green-700 mb-4">Manage your account settings</p>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Admin</h3>
            <p className="text-purple-700 mb-4">Administrative controls</p>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">My Profile</Button>
            </Link>
            <Link href="/admin">
              <Button variant="secondary">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
