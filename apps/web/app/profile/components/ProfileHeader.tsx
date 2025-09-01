import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export const ProfileHeader = () => {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Overview' } // Current page, no href
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Quick actions or status indicators can be added here */}
        </div>
      </div>
    </div>
  )
}
