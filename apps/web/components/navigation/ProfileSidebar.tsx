'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserIcon, CogIcon, BellIcon, ShieldCheckIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const profileNavigation = [
  { name: 'Overview', href: '/profile', icon: UserIcon, description: 'Profile picture & info' },
  { name: 'Order History', href: '/orders', icon: ShoppingBagIcon, description: 'Your purchases' },
  { name: 'Account Settings', href: '/profile/settings', icon: CogIcon, description: 'Preferences & config' },
  { name: 'Notifications', href: '/profile/notifications', icon: BellIcon, description: 'Alerts & updates' },
  { name: 'Security', href: '/profile/security', icon: ShieldCheckIcon, description: 'Password & privacy' },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Navigation - Bottom Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {profileNavigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
          aria-label="Open navigation menu"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close navigation menu"
              >
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {profileNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <nav className="space-y-1">
          {profileNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
