import { useUser } from '@clerk/nextjs'

type UserType = ReturnType<typeof useUser>['user']

interface PersonalInformationProps {
  user: UserType
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  isEditMode: boolean
  isUpdatingProfile: boolean
  hasChanges: boolean
  onEditClick: () => void
  onCancelEdit: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export const PersonalInformation = ({
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  isEditMode,
  isUpdatingProfile,
  hasChanges,
  onEditClick,
  onCancelEdit,
  onSubmit
}: PersonalInformationProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        {!isEditMode ? (
          <button
            onClick={onEditClick}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        ) : (
          <button
            onClick={onCancelEdit}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
      </div>

      {!isEditMode ? (
        // View Mode
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-sm text-gray-900">{firstName || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-sm text-gray-900">{lastName || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <p className="mt-1 text-sm text-gray-900">{user!.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={onSubmit} className="space-y-4" role="form" aria-labelledby="personal-info-heading">
          <h3 id="personal-info-heading" className="sr-only">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter first name"
                aria-describedby="firstName-help"
                aria-invalid={!firstName.trim() && hasChanges}
              />
              <div id="firstName-help" className="sr-only">Enter your first name as it appears on official documents</div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter last name"
                aria-describedby="lastName-help"
                aria-invalid={!lastName.trim() && hasChanges}
              />
              <div id="lastName-help" className="sr-only">Enter your last name as it appears on official documents</div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <p className="mt-1 text-sm text-gray-900">{user!.emailAddresses[0]?.emailAddress}</p>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
            </div>
          </div>
          
          {/* Status announcements for screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isUpdatingProfile && "Updating your profile information..."}
            {hasChanges && !isUpdatingProfile && "You have unsaved changes"}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile || !hasChanges}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
