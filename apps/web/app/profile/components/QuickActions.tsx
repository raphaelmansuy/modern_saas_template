import Link from 'next/link'
import { CogIcon, HomeIcon } from '@heroicons/react/24/outline'

export const QuickActions = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Link
          href="/admin"
          className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <CogIcon className="w-4 h-4 mr-2" />
          Admin Dashboard
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          User Dashboard
        </Link>
      </div>
    </div>
  )
}
