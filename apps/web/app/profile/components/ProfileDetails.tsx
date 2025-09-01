import { useUser } from '@clerk/nextjs'
import { PersonalInformation } from './PersonalInformation'
import { AccountStatus } from './AccountStatus'
import { QuickActions } from './QuickActions'
import { useState } from 'react'
import { UserIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/outline'

type UserType = ReturnType<typeof useUser>['user']

interface ProfileDetailsProps {
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

const profileTabs = [
  { id: 'personal', name: 'Personal Info', icon: UserIcon },
  { id: 'account', name: 'Account', icon: ShieldCheckIcon },
  { id: 'actions', name: 'Actions', icon: CogIcon },
]

export const ProfileDetails = ({
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
}: ProfileDetailsProps) => {
  const [activeTab, setActiveTab] = useState('personal')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInformation
            user={user}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            isEditMode={isEditMode}
            isUpdatingProfile={isUpdatingProfile}
            hasChanges={hasChanges}
            onEditClick={onEditClick}
            onCancelEdit={onCancelEdit}
            onSubmit={onSubmit}
          />
        )
      case 'account':
        return <AccountStatus user={user} />
      case 'actions':
        return <QuickActions />
      default:
        return null
    }
  }

  return (
    <div className="2xl:col-span-1 order-2 2xl:order-2">
      {/* Mobile Tabs */}
      <div className="md:hidden mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-1">
          <div className="grid grid-cols-3 gap-1">
            {profileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-center leading-tight">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-4 md:space-y-6 lg:space-y-8">
        <PersonalInformation
          user={user}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          isEditMode={isEditMode}
          isUpdatingProfile={isUpdatingProfile}
          hasChanges={hasChanges}
          onEditClick={onEditClick}
          onCancelEdit={onCancelEdit}
          onSubmit={onSubmit}
        />

        <AccountStatus user={user} />

        <QuickActions />
      </div>

      {/* Mobile Tab Content */}
      <div className="md:hidden">
        {renderTabContent()}
      </div>
    </div>
  )
}
