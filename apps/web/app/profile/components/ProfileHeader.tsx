import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { ChevronDownIcon, UserIcon, CogIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const quickActions = [
  { name: 'Edit Profile', href: '#personal-info', icon: UserIcon, action: 'edit' },
  { name: 'Account Settings', href: '/profile/settings', icon: CogIcon },
  { name: 'Notifications', href: '/profile/notifications', icon: BellIcon },
  { name: 'Security', href: '/profile/security', icon: ShieldCheckIcon },
]

export const ProfileHeader = () => {
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Overview' }
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Desktop Breadcrumb */}
      <div className="hidden md:block">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Mobile Header with Quick Actions */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account</p>
          </div>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>Quick Actions</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      onClick={() => setShowQuickActions(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <action.icon className="w-5 h-5 text-gray-400" />
                      <span>{action.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Desktop Quick Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {quickActions.slice(0, 3).map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
