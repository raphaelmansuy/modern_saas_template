import { useUser } from '@clerk/nextjs'
import { PersonalInformation } from './PersonalInformation'
import { AccountStatus } from './AccountStatus'
import { QuickActions } from './QuickActions'

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
  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
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
    </div>
  )
}
