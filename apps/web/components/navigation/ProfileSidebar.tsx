'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserIcon, CogIcon, BellIcon, ShieldCheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

const profileNavigation = [
  { name: 'Overview', href: '/profile', icon: UserIcon },
  { name: 'Order History', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Account Settings', href: '/profile/settings', icon: CogIcon },
  { name: 'Notifications', href: '/profile/notifications', icon: BellIcon },
  { name: 'Security', href: '/profile/security', icon: ShieldCheckIcon },
]

export function ProfileSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-2">
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
  )
}
