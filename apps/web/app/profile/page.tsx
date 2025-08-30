'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null)
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

  // Enhanced UX state
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [originalFileSize, setOriginalFileSize] = useState<number>(0)
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null)
  const [zoom, setZoom] = useState(1)
  const [maxZoom] = useState(3)
  const [minZoom] = useState(0.5)

  // Check if there are any changes to enable/disable save button
  const hasChanges = firstName.trim() !== originalFirstName || lastName.trim() !== originalLastName

  // Online status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cleanup object URLs on unmount
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

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

  // Enhanced file validation
  const validateImageFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Please select: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
      }
    }

    // Check file size (50MB max for initial validation)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 50MB.'
      }
    }

    // Check if file is actually an image by trying to load it
    try {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl)
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
          resolve(true)
        }
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('Invalid image file'))
        }
        img.src = objectUrl
      })

      // Check minimum dimensions
      if (img.naturalWidth < 100 || img.naturalHeight < 100) {
        return {
          isValid: false,
          error: 'Image must be at least 100x100 pixels for good quality.'
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'The selected file appears to be corrupted or is not a valid image.'
      }
    }
  }

  const processFile = async (file: File) => {
    setMessage(null)
    setIsImageValid(null)

    // Validate the file
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.error! })
      setIsImageValid(false)
      return
    }

    setIsImageValid(true)
    setSelectedFile(file)
    setSelectedName(file.name)
    setOriginalFileSize(file.size)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setMessage({
      type: 'success',
      text: `Image selected successfully! ${imageDimensions ? `${imageDimensions.width}x${imageDimensions.height}px` : ''} - ${(file.size / 1024 / 1024).toFixed(2)}MB`
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await processFile(file)
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    if (files.length > 1) {
      setMessage({ type: 'warning', text: 'Please select only one image file.' })
      return
    }

    const file = files[0]
    await processFile(file)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile || !isOnline) return

    if (!isOnline) {
      setMessage({ type: 'error', text: 'No internet connection. Please check your connection and try again.' })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setMessage({ type: 'info', text: 'Starting upload...' })

    try {
      // If the file hasn't been compressed yet, compress it
      let fileToUpload = selectedFile
      if (selectedFile.size > 1024 * 1024) { // If larger than 1MB, compress
        setMessage({ type: 'info', text: 'Compressing image before upload...' })
        fileToUpload = await compressImage(selectedFile)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await user!.setProfileImage({ file: fileToUpload })

      setUploadProgress(100)
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' })

      // Reset state
      handleCancelSelection()
      clearInterval(progressInterval)
    } catch (error) {
      console.error('Error uploading profile picture:', error)

      // Retry logic for network errors
      if (retryCount < 3 && (error as Error).message.includes('network')) {
        setRetryCount(prev => prev + 1)
        setMessage({
          type: 'warning',
          text: `Upload failed. Retrying... (${retryCount + 1}/3)`
        })
        setTimeout(() => handleConfirmUpload(), 2000)
        return
      }

      setMessage({
        type: 'error',
        text: retryCount > 0
          ? 'Upload failed after multiple attempts. Please try again later.'
          : 'Failed to upload profile picture. Please try again.'
      })
      setRetryCount(0)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
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
    setOriginalFileSize(0)
    setCompressedFileSize(0)
    setImageDimensions(null)
    setIsImageValid(null)
    setZoom(1)
    setMessage(null)
    setRetryCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture? This action cannot be undone.')) return

    try {
      await user!.setProfileImage({ file: null })
      setMessage({ type: 'success', text: 'Profile picture removed successfully!' })
    } catch (error) {
      console.error('Error removing profile picture:', error)
      setMessage({ type: 'error', text: 'Failed to remove profile picture. Please try again.' })
    }
  }

  // Enhanced image compression with progress
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width or height
      useWebWorker: true,
      quality: 0.8, // Image quality (0-1)
      onProgress: (progress: number) => {
        setCompressionProgress(progress)
      }
    }

    try {
      setCompressionProgress(0)
      const compressedFile = await imageCompression(file, options)
      setCompressedFileSize(compressedFile.size)
      setCompressionProgress(100)
      return compressedFile
    } catch (error) {
      console.error('Error compressing image:', error)
      setCompressionProgress(0)
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
    setMessage({ type: 'info', text: 'Processing image...' })

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
      setMessage({
        type: 'success',
        text: `Image processed successfully! Size reduced from ${(originalFileSize / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      })

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

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, maxZoom))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, minZoom))
  }

  const handleZoomReset = () => {
    setZoom(1)
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
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : user!.imageUrl ? (
                        <img
                          src={user!.imageUrl}
                          alt="Current profile picture"
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
                        aria-label="Select profile picture"
                      />
                    </div>

                    {/* Enhanced Upload Area with Drag & Drop */}
                    <div
                      className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                        isDragOver
                          ? 'border-indigo-500 bg-indigo-50'
                          : selectedFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={handleUploadClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleUploadClick()
                        }
                      }}
                      aria-label="Upload profile picture - click to browse or drag and drop"
                    >
                      <div className="text-center">
                        <svg
                          className={`mx-auto h-12 w-12 ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`}
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
                            {isDragOver ? 'Drop your image here' : 'Click to upload or drag and drop'}
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
                    {(isUploading || isCompressing) && (
                      <div className="w-full space-y-2">
                        {isCompressing && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Compressing...</span>
                              <span>{compressionProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${compressionProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {isUploading && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-center space-y-2 w-full">
                      {/* Confirm / Cancel actions when a file is selected */}
                      {selectedFile && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => setShowCropModal(true)}
                            disabled={isUploading || isCompressing || !isImageValid}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Crop and compress image"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Crop & Compress
                          </button>
                          <button
                            onClick={handleConfirmUpload}
                            disabled={isUploading || isCompressing || !isImageValid || !isOnline}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Upload image as-is"
                          >
                            {isUploading ? 'Uploading...' : 'Upload as-is'}
                          </button>
                          <button
                            onClick={handleCancelSelection}
                            disabled={isUploading || isCompressing}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Cancel selection"
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
                        <div className="flex items-center text-xs text-red-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Offline - Upload disabled
                        </div>
                      )}

                      {/* Inline message */}
                      {message && (
                        <div
                          className={`mt-2 px-3 py-2 text-sm rounded-md w-full text-center ${
                            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                            message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                            'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                          role="alert"
                          aria-live="polite"
                        >
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

      {/* Enhanced Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crop & Compress Image</h3>
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= minZoom}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Zoom out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600 min-w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= maxZoom}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Zoom in"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                    aria-label="Reset zoom"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mb-4">
                {previewUrl && (
                  <div className="flex justify-center">
                    <div
                      className="relative overflow-hidden border border-gray-300 rounded"
                      style={{
                        width: '400px',
                        height: '400px',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center'
                      }}
                    >
                      <ReactCrop
                        crop={crop}
                        onChange={setCrop}
                        onComplete={onCropComplete}
                        aspect={1}
                        minWidth={100}
                        minHeight={100}
                        className="max-w-full max-h-full"
                      >
                        <img
                          src={previewUrl}
                          alt="Crop preview"
                          onLoad={onImageLoad}
                          className="max-w-none"
                          style={{
                            transform: `scale(${1/zoom})`,
                            transformOrigin: 'center'
                          }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 space-y-1">
                  {completedCrop && (
                    <div>
                      <div>Crop size: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} pixels</div>
                      <div>Aspect ratio: {Math.round((completedCrop.width / completedCrop.height) * 100) / 100}:1</div>
                    </div>
                  )}
                  {imageDimensions && (
                    <div>Original: {imageDimensions.width} × {imageDimensions.height} pixels</div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelCrop}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
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
