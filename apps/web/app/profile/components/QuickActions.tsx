import Link from 'next/link'

export const QuickActions = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Admin Dashboard
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          User Dashboard
        </Link>
      </div>
    </div>
  )
}
