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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ProfileHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  )
}
