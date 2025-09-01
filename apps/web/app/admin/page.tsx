'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BreadcrumbItem } from '@/lib/store/navigation'
import {
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin' }
]

export default function AdminPage() {
  const { user, isLoaded } = useUser()

  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.isAdmin === true

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
  }

  if (!isLoaded) {
    return (
      <PageLayout
        title="Admin Dashboard"
        description="Loading admin dashboard..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

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
        {!isAdmin ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Access Restricted
                </h2>
                <p className="text-gray-600 mb-6">
                  You don't have administrator privileges to access this page.
                </p>
                <Badge variant="secondary" className="mb-6">
                  Current Role: {(user?.publicMetadata?.role as string) || 'User'}
                </Badge>
              </div>

              <div className="space-y-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full">
                    Return to Dashboard
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  Contact your administrator to request access.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Admin Welcome Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'Admin'} />
                  <AvatarFallback className="text-lg bg-purple-100 text-purple-700">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.firstName || 'Admin'}!
                  </h1>
                  <p className="text-gray-600">
                    Manage your system and monitor performance.
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      Administrator
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Last login: {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Function Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UsersIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Users</CardTitle>
                      <CardDescription>Manage user accounts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    View, edit, and manage all user accounts and permissions.
                  </p>
                  <Link href="/admin/users">
                    <Button className="w-full" variant="outline">
                      Manage Users
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ChartBarIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Analytics</CardTitle>
                      <CardDescription>View system analytics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Monitor system performance and user engagement metrics.
                  </p>
                  <Link href="/admin/analytics">
                    <Button className="w-full" variant="outline">
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CogIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Settings</CardTitle>
                      <CardDescription>Configure system settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage application configuration and preferences.
                  </p>
                  <Link href="/admin/settings">
                    <Button className="w-full" variant="outline">
                      Configure
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ArrowPathIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Order Sync</CardTitle>
                      <CardDescription>Manage Stripe sync</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Monitor and manage order synchronization with Stripe.
                  </p>
                  <Link href="/admin/order-sync">
                    <Button className="w-full" variant="outline">
                      Manage Sync
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <UsersIcon className="w-6 h-6" />
                      <span className="text-sm">Users</span>
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <ChartBarIcon className="w-6 h-6" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <CogIcon className="w-6 h-6" />
                      <span className="text-sm">Settings</span>
                    </Button>
                  </Link>
                  <Link href="/admin/order-sync">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <ArrowPathIcon className="w-6 h-6" />
                      <span className="text-sm">Sync</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="text-indigo-600 hover:text-indigo-500 transition-colors">
                ← Back to Home
              </Link>
              <Link href="/dashboard" className="text-green-600 hover:text-green-500 transition-colors">
                User Dashboard
              </Link>
              <Link href="/profile" className="text-blue-600 hover:text-blue-500 transition-colors">
                My Profile
              </Link>
            </div>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="mb-6">
                <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Admin Access Required
                </h2>
                <p className="text-gray-600 mb-4">
                  Please sign in with an administrator account to access this page.
                </p>
              </div>
              <SignInButton mode="modal">
                <Button size="lg">
                  Sign In as Admin
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
    </PageLayout>
  )
}
