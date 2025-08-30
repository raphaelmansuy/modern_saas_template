'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalFirstName, setOriginalFirstName] = useState('')
  const [originalLastName, setOriginalLastName] = useState('')

  // Image cropping and compression state
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  // Check if there are any changes to enable/disable save button
  const hasChanges = firstName.trim() !== originalFirstName || lastName.trim() !== originalLastName

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl)
    }
  }, [previewUrl, croppedImageUrl])

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setMessage(null)

    try {
      const token = await getToken()
      const response = await fetch('http://localhost:3001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      // Update the user object to reflect changes
      await user!.reload()

      // Update original values and exit edit mode
      setOriginalFirstName(firstName.trim())
      setOriginalLastName(lastName.trim())
      setIsEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    setMessage(null)
  }

  const handleCancelEdit = () => {
    // Restore original values
    setFirstName(originalFirstName)
    setLastName(originalLastName)
    setIsEditMode(false)
    setMessage(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' })
      return
    }

    // Validate file size (max 10MB for initial upload, will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB.' })
      return
    }

    setSelectedFile(file)
    setSelectedName(file.name)
    setMessage({ type: 'info', text: 'Image selected. Click "Crop & Compress" to process the image.' })
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setMessage(null)

    try {
      // If the file hasn't been compressed yet, compress it
      let fileToUpload = selectedFile
      if (selectedFile.size > 1024 * 1024) { // If larger than 1MB, compress
        setMessage({ type: 'info', text: 'Compressing image before upload...' })
        fileToUpload = await compressImage(selectedFile)
      }

      await user!.setProfileImage({ file: fileToUpload })
      setMessage({ type: 'success', text: 'Profile picture updated.' })
      // refresh preview to use provider URL
      setPreviewUrl(null)
      setSelectedFile(null)
      setSelectedName(null)
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
    setSelectedName(null)
    setCroppedImageUrl(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePicture = async () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      try {
        await user!.setProfileImage({ file: null })
        alert('Profile picture removed successfully!')
      } catch (error) {
        console.error('Error removing profile picture:', error)
        alert('Failed to remove profile picture. Please try again.')
      }
    }
  }

  // Image compression function
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width or height
      useWebWorker: true,
      quality: 0.8, // Image quality (0-1)
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Error compressing image:', error)
      return file // Return original file if compression fails
    }
  }

  // Get cropped image as blob
  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return Promise.reject(new Error('No 2d context'))
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  // Handle crop completion
  const onCropComplete = async (crop: PixelCrop) => {
    setCompletedCrop(crop)

    if (imageRef && crop.width && crop.height) {
      try {
        const croppedBlob = await getCroppedImg(imageRef, crop)
        if (croppedBlob) {
          const croppedUrl = URL.createObjectURL(croppedBlob)
          setCroppedImageUrl(croppedUrl)
        }
      } catch (error) {
        console.error('Error creating cropped image:', error)
      }
    }
  }

  // Handle crop modal close and apply crop
  const handleApplyCrop = async () => {
    if (!selectedFile || !croppedImageUrl) return

    setIsCompressing(true)
    setMessage({ type: 'info', text: 'Compressing image...' })

    try {
      // Convert cropped image URL to File
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' })

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile)

      // Update the selected file with compressed version
      setSelectedFile(compressedFile)
      setPreviewUrl(URL.createObjectURL(compressedFile))
      setMessage({ type: 'success', text: 'Image cropped and compressed successfully!' })

      // Close crop modal
      setShowCropModal(false)
      setCroppedImageUrl(null)
    } catch (error) {
      console.error('Error processing image:', error)
      setMessage({ type: 'error', text: 'Failed to process image. Please try again.' })
    } finally {
      setIsCompressing(false)
    }
  }

  // Handle crop modal cancel
  const handleCancelCrop = () => {
    setShowCropModal(false)
    setCroppedImageUrl(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  // Initialize crop when image loads
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setImageRef(e.currentTarget)

    // Create a square crop in the center
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50,
        },
        1, // aspect ratio (square)
        width,
        height
      ),
      width,
      height
    )

    setCrop(crop)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Home
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      {/* show preview if user selected a new file, otherwise existing image or initials */}
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : user!.imageUrl ? (
                        <img
                          src={user!.imageUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                          {user!.firstName?.[0] || user!.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    <div className="flex flex-col items-center space-y-2 w-full">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleUploadClick}
                          disabled={isUploading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? 'Uploading...' : 'Choose file'}
                        </button>

                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {selectedName || 'No file chosen'}
                        </div>
                      </div>

                      {/* Confirm / Cancel actions when a file is selected */}
                      {selectedFile && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowCropModal(true)}
                            disabled={isUploading || isCompressing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCompressing ? 'Processing...' : 'Crop & Compress'}
                          </button>
                          <button
                            onClick={handleConfirmUpload}
                            disabled={isUploading || isCompressing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? 'Uploading...' : 'Upload as-is'}
                          </button>
                          <button
                            onClick={handleCancelSelection}
                            disabled={isUploading || isCompressing}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="flex items-center mt-1">
                        <button
                          onClick={handleRemovePicture}
                          disabled={isUploading || !user!.imageUrl}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Inline message */}
                      {message && (
                        <div
                          className={`mt-2 px-3 py-1 text-sm rounded-md ${
                            message.type === 'success' ? 'bg-green-50 text-green-800' : message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                          }`}>
                          {message.text}
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {user!.firstName} {user!.lastName}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {user!.emailAddresses[0]?.emailAddress}
                    </p>
                    <div className="text-sm text-gray-500">
                      Member since {user!.createdAt ? new Date(user!.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      {!isEditMode ? (
                        <button
                          onClick={handleEditClick}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelEdit}
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
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter last name"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <p className="mt-1 text-sm text-gray-900">{user!.emailAddresses[0]?.emailAddress}</p>
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdatingProfile || !hasChanges}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Account Status */}
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

                  {/* Quick Actions */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crop & Compress Image</h3>
              <div className="mb-4">
                {previewUrl && (
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={onCropComplete}
                    aspect={1}
                    minWidth={100}
                    minHeight={100}
                  >
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-w-full max-h-96 object-contain"
                    />
                  </ReactCrop>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {completedCrop && (
                    <span>
                      Crop size: {Math.round(completedCrop.width)} x {Math.round(completedCrop.height)} pixels
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelCrop}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    disabled={isCompressing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCrop}
                    disabled={!completedCrop || isCompressing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompressing ? 'Processing...' : 'Apply Crop & Compress'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
