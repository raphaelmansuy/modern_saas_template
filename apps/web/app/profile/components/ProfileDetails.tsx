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
    <div className="2xl:col-span-1 order-2 2xl:order-2">
      <div className="space-y-4 md:space-y-6 lg:space-y-8">
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
