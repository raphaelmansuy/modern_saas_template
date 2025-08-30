import { useUser } from '@clerk/nextjs'

type UserType = ReturnType<typeof useUser>['user']

interface AccountStatusProps {
  user: UserType
}

export const AccountStatus = ({ user }: AccountStatusProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Email Verified</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user!.emailAddresses[0]?.verification?.status === 'verified'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user!.emailAddresses[0]?.verification?.status === 'verified' ? 'Verified' : 'Pending'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Account Created</span>
          <span className="text-sm text-gray-900">
            {user!.createdAt ? new Date(user!.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Last Updated</span>
          <span className="text-sm text-gray-900">
            {user!.updatedAt ? new Date(user!.updatedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  )
}
