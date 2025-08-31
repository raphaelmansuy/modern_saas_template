import { useUser, useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { apiClient } from '../../../lib/api'

export const useProfileData = () => {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalFirstName, setOriginalFirstName] = useState('')
  const [originalLastName, setOriginalLastName] = useState('')

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const initialFirstName = user.firstName || ''
      const initialLastName = user.lastName || ''
      setFirstName(initialFirstName)
      setLastName(initialLastName)
      setOriginalFirstName(initialFirstName)
      setOriginalLastName(initialLastName)
    }
  }, [user])

  const hasChanges = firstName.trim() !== originalFirstName || lastName.trim() !== originalLastName

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Only include fields that have changed
      const updateData: any = {}
      const trimmedFirstName = firstName.trim()
      const trimmedLastName = lastName.trim()
      
      if (trimmedFirstName !== originalFirstName) {
        updateData.firstName = trimmedFirstName
      }
      if (trimmedLastName !== originalLastName) {
        updateData.lastName = trimmedLastName
      }

      const response = await apiClient.put('/api/user/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to update profile'
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Update the user object to reflect changes
      await user!.reload()

      // Update original values and exit edit mode
      setOriginalFirstName(trimmedFirstName)
      setOriginalLastName(trimmedLastName)
      setIsEditMode(false)

      return { success: true, message: 'Profile updated successfully!' }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' }
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    // Restore original values
    setFirstName(originalFirstName)
    setLastName(originalLastName)
    setIsEditMode(false)
  }

  return {
    user,
    isLoaded,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    isUpdatingProfile,
    isEditMode,
    hasChanges,
    handleProfileUpdate,
    handleEditClick,
    handleCancelEdit
  }
}
