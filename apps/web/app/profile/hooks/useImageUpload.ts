import { useUser } from '@clerk/nextjs'
import { useState, useRef, useCallback } from 'react'
import { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { validateImageFile, compressImage, getCroppedImg, getImageDimensions } from '../utils/imageUtils'
import { IMAGE_CONFIG, UPLOAD_CONFIG } from '../utils/constants'

export const useImageUpload = () => {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [originalFileSize, setOriginalFileSize] = useState<number>(0)
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null)

  // Crop state
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [zoom, setZoom] = useState<number>(IMAGE_CONFIG.ZOOM.DEFAULT)

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)

  const processFile = async (file: File) => {
    setIsImageValid(null)

    // Validate the file
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      setIsImageValid(false)
      return validation
    }

    setIsImageValid(true)
    setSelectedFile(file)
    setSelectedName(file.name)
    setOriginalFileSize(file.size)

    const dimensions = await getImageDimensions(file)
    setImageDimensions(dimensions)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return { success: true, message: `Image selected successfully! ${dimensions.width}x${dimensions.height}px - ${(file.size / 1024 / 1024).toFixed(2)}MB` }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    return await processFile(file)
  }

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
      return { success: false, message: 'Please select only one image file.' }
    }

    const file = files[0]
    return await processFile(file)
  }, [])

  const handleConfirmUpload = async (isOnline: boolean) => {
    if (!selectedFile || !isOnline) return

    if (!isOnline) {
      return { success: false, message: 'No internet connection. Please check your connection and try again.' }
    }

    setIsUploading(true)
    setUploadProgress(0)
    setRetryCount(0)

    try {
      // If the file hasn't been compressed yet, compress it
      let fileToUpload = selectedFile
      if (selectedFile.size > 1024 * 1024) { // If larger than 1MB, compress
        fileToUpload = await compressImage(selectedFile, (progress) => {
          setUploadProgress(progress * 0.9) // Reserve 10% for actual upload
        })
      }

      // Simulate upload progress for the remaining 10%
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, UPLOAD_CONFIG.PROGRESS_UPDATE_INTERVAL)

      await user!.setProfileImage({ file: fileToUpload })

      setUploadProgress(100)
      clearInterval(progressInterval)
      handleCancelSelection()

      return { success: true, message: 'Profile picture updated successfully!' }
    } catch (error) {
      console.error('Error uploading profile picture:', error)

      // Retry logic for network errors
      if (retryCount < UPLOAD_CONFIG.MAX_RETRIES && (error as Error).message.includes('network')) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => handleConfirmUpload(isOnline), UPLOAD_CONFIG.RETRY_DELAY)
        return { success: false, message: `Upload failed. Retrying... (${retryCount + 1}/${UPLOAD_CONFIG.MAX_RETRIES})` }
      }

      setRetryCount(0)
      return {
        success: false,
        message: retryCount > 0
          ? 'Upload failed after multiple attempts. Please try again later.'
          : 'Failed to upload profile picture. Please try again.'
      }
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
    setZoom(IMAGE_CONFIG.ZOOM.DEFAULT)
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
      return { success: true, message: 'Profile picture removed successfully!' }
    } catch (error) {
      console.error('Error removing profile picture:', error)
      return { success: false, message: 'Failed to remove profile picture. Please try again.' }
    }
  }

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

  const handleApplyCrop = async () => {
    if (!selectedFile || !croppedImageUrl) return

    setIsCompressing(true)

    try {
      // Convert cropped image URL to File
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' })

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile, (progress) => {
        // Progress handled by compression
      })

      // Update the selected file with compressed version
      setSelectedFile(compressedFile)
      setPreviewUrl(URL.createObjectURL(compressedFile))
      setCompressedFileSize(compressedFile.size)

      // Close crop modal
      setShowCropModal(false)
      setCroppedImageUrl(null)

      return {
        success: true,
        message: `Image processed successfully! Size reduced from ${(originalFileSize / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      }
    } catch (error) {
      console.error('Error processing image:', error)
      return { success: false, message: 'Failed to process image. Please try again.' }
    } finally {
      setIsCompressing(false)
    }
  }

  const handleCancelCrop = () => {
    setShowCropModal(false)
    setCroppedImageUrl(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

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
        IMAGE_CONFIG.CROP_ASPECT_RATIO,
        width,
        height
      ),
      width,
      height
    )

    setCrop(crop)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + IMAGE_CONFIG.ZOOM.STEP, IMAGE_CONFIG.ZOOM.MAX))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - IMAGE_CONFIG.ZOOM.STEP, IMAGE_CONFIG.ZOOM.MIN))
  }

  const handleZoomReset = () => {
    setZoom(IMAGE_CONFIG.ZOOM.DEFAULT)
  }

  return {
    // Refs
    fileInputRef,

    // Upload state
    isUploading,
    uploadProgress,
    compressionProgress,
    retryCount,

    // File state
    selectedFile,
    selectedName,
    previewUrl,
    originalFileSize,
    compressedFileSize,
    imageDimensions,
    isImageValid,

    // Crop state
    crop,
    setCrop,
    completedCrop,
    showCropModal,
    setShowCropModal,
    imageRef,
    croppedImageUrl,
    isCompressing,
    zoom,

    // Drag and drop state
    isDragOver,

    // Handlers
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
  }
}
