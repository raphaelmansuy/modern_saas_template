import { useUser } from '@clerk/nextjs'
import { MessageDisplay } from './MessageDisplay'
import { UploadProgress } from './UploadProgress'
import React from 'react'

type UserType = ReturnType<typeof useUser>['user']

interface ProfileOverviewProps {
  user: UserType
  previewUrl: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isDragOver: boolean
  selectedFile: File | null
  selectedName: string | null
  imageDimensions: { width: number; height: number } | null
  originalFileSize: number
  compressedFileSize: number
  isUploading: boolean
  isCompressing: boolean
  uploadProgress: number
  compressionProgress: number
  isImageValid: boolean | null
  isOnline: boolean
  message: { type: 'success' | 'error' | 'info' | 'warning'; text: string } | null
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<any>
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => Promise<any>
  onUploadClick: () => void
  onConfirmUpload: () => Promise<any>
  onCancelSelection: () => void
  onRemovePicture: () => Promise<any>
  onCropClick: () => void
}

export const ProfileOverview = ({
  user,
  previewUrl,
  fileInputRef,
  isDragOver,
  selectedFile,
  selectedName,
  imageDimensions,
  originalFileSize,
  compressedFileSize,
  isUploading,
  isCompressing,
  uploadProgress,
  compressionProgress,
  isImageValid,
  isOnline,
  message,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadClick,
  onConfirmUpload,
  onCancelSelection,
  onRemovePicture,
  onCropClick
}: ProfileOverviewProps) => {
  // Detect if device is mobile for adaptive UI
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="2xl:col-span-1 order-1 2xl:order-1">
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="relative">
            {/* Profile Picture Display */}
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : user!.imageUrl ? (
              <img
                src={user!.imageUrl}
                alt="Current profile picture"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold border-4 border-white shadow-lg">
                {user!.firstName?.[0] || user!.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <input
              ref={fileInputRef as React.LegacyRef<HTMLInputElement>}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
              aria-label="Select profile picture"
            />
          </div>

          {/* Enhanced Upload Area with Mobile Optimization */}
          <div
            className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
              isDragOver && !isMobile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onUploadClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onUploadClick()
              }
            }}
            aria-label="Upload profile picture - click to browse or drag and drop"
          >
            <div className="text-center">
              <svg
                className={`mx-auto h-10 w-10 md:h-12 md:w-12 ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-2">
                <p className={`text-sm font-medium ${isDragOver ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {isMobile ? 'Tap to select image' : isDragOver ? 'Drop your image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP up to 50MB
                </p>
              </div>
            </div>
          </div>

          {/* File Info Display */}
          {selectedFile && (
            <div className="w-full text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="truncate max-w-32" title={selectedName || ''}>
                  {selectedName}
                </span>
              </div>
              {imageDimensions && (
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{imageDimensions.width}×{imageDimensions.height}px</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{(originalFileSize / 1024 / 1024).toFixed(2)}MB</span>
              </div>
              {compressedFileSize > 0 && (
                <div className="flex justify-between">
                  <span>Compressed:</span>
                  <span className="text-green-600">
                    {(compressedFileSize / 1024 / 1024).toFixed(2)}MB
                    ({Math.round((1 - compressedFileSize / originalFileSize) * 100)}% smaller)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progress Indicators */}
          <UploadProgress
            isUploading={isUploading}
            isCompressing={isCompressing}
            uploadProgress={uploadProgress}
            compressionProgress={compressionProgress}
          />

          <div className="flex flex-col items-center space-y-2 w-full">
            {/* Confirm / Cancel actions when a file is selected */}
            {selectedFile && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full">
                <button
                  onClick={onCropClick}
                  disabled={isUploading || isCompressing || !isImageValid}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Crop and compress image"
                >
                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Crop & Compress
                </button>
                <button
                  onClick={onConfirmUpload}
                  disabled={isUploading || isCompressing || !isImageValid || !isOnline}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Upload image as-is"
                >
                  {isUploading ? 'Uploading...' : 'Upload as-is'}
                </button>
                <button
                  onClick={onCancelSelection}
                  disabled={isUploading || isCompressing}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cancel selection"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center mt-1">
              <button
                onClick={onRemovePicture}
                disabled={isUploading || !user!.imageUrl}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove current profile picture"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>

            {/* Connection Status */}
            {!isOnline && (
              <div className="flex items-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2 w-full">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">You're offline</p>
                  <p className="text-red-500">Image upload is disabled. Your changes will be saved when connection is restored.</p>
                </div>
              </div>
            )}

            {/* Inline message */}
            <MessageDisplay message={message} />
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
  )
}
