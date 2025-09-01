'use client'

import { useEffect } from 'react'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileOverview } from './components/ProfileOverview'
import { ProfileDetails } from './components/ProfileDetails'
import { ImageCropModal } from './components/ImageCropModal'
import { useProfileData } from './hooks/useProfileData'
import { useImageUpload } from './hooks/useImageUpload'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useMessage } from './hooks/useMessage'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { ProfileSidebar } from '@/components/navigation/ProfileSidebar'

export default function ProfilePage() {
  const isOnline = useOnlineStatus()
  const { message, showMessage } = useMessage()

  const {
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
  } = useProfileData()

  const {
    fileInputRef,
    selectedFile,
    selectedName,
    previewUrl,
    originalFileSize,
    compressedFileSize,
    imageDimensions,
    isImageValid,
    crop,
    setCrop,
    completedCrop,
    showCropModal,
    setShowCropModal,
    isUploading,
    uploadProgress,
    isCompressing,
    compressionProgress,
    isDragOver,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleConfirmUpload,
    handleCancelSelection,
    handleUploadClick,
    handleRemovePicture,
    onCropComplete,
    handleApplyCrop,
    handleCancelCrop,
    onImageLoad,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset
  } = useImageUpload()

  // Handle profile update with message display
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await handleProfileUpdate()
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Handle file selection with message display
  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileSelect(event)
    if (result && 'success' in result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Handle drag and drop with message display
  const handleFileDrop = async (e: React.DragEvent) => {
    const result = await handleDrop(e)
    if (result && 'success' in result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Handle upload confirmation with message display
  const handleUploadConfirmation = async () => {
    const result = await handleConfirmUpload(isOnline)
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Handle picture removal with message display
  const handlePictureRemoval = async () => {
    const result = await handleRemovePicture()
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Handle crop application with message display
  const handleCropApplication = async () => {
    const result = await handleApplyCrop()
    if (result) {
      showMessage(result.success ? 'success' : 'error', result.message)
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!isLoaded) {
    return (
      <SidebarLayout sidebar={<ProfileSidebar />}>
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm md:text-base text-gray-600">Loading your profile...</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-4 md:space-y-6">
        <ProfileHeader />

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 2xl:gap-8">
          <ProfileOverview
            user={user}
            previewUrl={previewUrl}
            fileInputRef={fileInputRef}
            isDragOver={isDragOver}
            selectedFile={selectedFile}
            selectedName={selectedName}
            imageDimensions={imageDimensions}
            originalFileSize={originalFileSize}
            compressedFileSize={compressedFileSize}
            isUploading={isUploading}
            isCompressing={isCompressing}
            uploadProgress={uploadProgress}
            compressionProgress={compressionProgress}
            isImageValid={isImageValid}
            isOnline={isOnline}
            message={message}
            onFileSelect={handleFileSelection}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onUploadClick={handleUploadClick}
            onConfirmUpload={handleUploadConfirmation}
            onCancelSelection={handleCancelSelection}
            onRemovePicture={handlePictureRemoval}
            onCropClick={() => setShowCropModal(true)}
          />

          <ProfileDetails
            user={user}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            isEditMode={isEditMode}
            isUpdatingProfile={isUpdatingProfile}
            hasChanges={hasChanges}
            onEditClick={handleEditClick}
            onCancelEdit={handleCancelEdit}
            onSubmit={handleProfileSubmit}
          />
        </div>
      </div>

      <ImageCropModal
        showCropModal={showCropModal}
        previewUrl={previewUrl}
        crop={crop}
        setCrop={setCrop}
        completedCrop={completedCrop}
        imageDimensions={imageDimensions}
        zoom={1} // Default zoom
        onImageLoad={onImageLoad}
        onCropComplete={onCropComplete}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onApplyCrop={handleCropApplication}
        onCancelCrop={handleCancelCrop}
        isCompressing={isCompressing}
      />
    </SidebarLayout>
  )
}
