'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { Input } from '@/components/ui'
import { MagnifyingGlassIcon, HomeIcon, ArrowLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('')

  const popularPages = [
    { name: 'Dashboard', href: '/dashboard', description: 'Your main dashboard' },
    { name: 'Products', href: '/products', description: 'Browse our products' },
    { name: 'Profile', href: '/profile', description: 'Manage your account' },
    { name: 'Admin', href: '/admin', description: 'Administrative panel' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search through the site
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
              <p className="text-gray-500">
                Don&apos;t worry, let&apos;s get you back on track!
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-md mx-auto mb-8">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">
                  Search
                </Button>
              </form>
            </div>

            {/* Popular Pages */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Popular Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {popularPages.map((page) => (
                  <Link key={page.href} href={page.href}>
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">{page.name}</h3>
                      <p className="text-sm text-gray-600">{page.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/">
                <Button size="lg" className="flex items-center space-x-2">
                  <HomeIcon className="w-5 h-5" />
                  <span>Go Home</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-6">
                  If you believe this page should exist or you&apos;re experiencing issues,
                  please contact our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@example.com"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Contact Support
                  </a>
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Browse Site Map
                  </Link>
                </div>
              </div>
            </div>

            {/* Sitemap Preview */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Main</h4>
                  <div className="space-y-1 text-sm">
                    <Link href="/" className="block text-blue-600 hover:text-blue-700">Home</Link>
                    <Link href="/dashboard" className="block text-blue-600 hover:text-blue-700">Dashboard</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account</h4>
                  <div className="space-y-1 text-sm">
                    <Link href="/profile" className="block text-blue-600 hover:text-blue-700">Profile</Link>
                    <Link href="/sign-in" className="block text-blue-600 hover:text-blue-700">Sign In</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Products</h4>
                  <div className="space-y-1 text-sm">
                    <Link href="/products" className="block text-blue-600 hover:text-blue-700">Browse</Link>
                    <Link href="/payment/success" className="block text-blue-600 hover:text-blue-700">Orders</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin</h4>
                  <div className="space-y-1 text-sm">
                    <Link href="/admin" className="block text-blue-600 hover:text-blue-700">Panel</Link>
                    <Link href="/admin/order-sync" className="block text-blue-600 hover:text-blue-700">Sync</Link>
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
