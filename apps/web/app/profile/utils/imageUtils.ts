import imageCompression from 'browser-image-compression'
import { IMAGE_CONFIG } from './constants'

export interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export interface ImageDimensions {
  width: number
  height: number
}

export const validateImageFile = async (file: File): Promise<ImageValidationResult> => {
  // Check file type
  if (!IMAGE_CONFIG.ACCEPTED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please select: ${IMAGE_CONFIG.ACCEPTED_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    }
  }

  // Check file size
  const maxSize = IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${IMAGE_CONFIG.MAX_SIZE_MB}MB.`
    }
  }

  // Check if file is actually an image by trying to load it
  try {
    const dimensions = await getImageDimensions(file)

    // Check minimum dimensions
    if (dimensions.width < IMAGE_CONFIG.MIN_DIMENSIONS.width || dimensions.height < IMAGE_CONFIG.MIN_DIMENSIONS.height) {
      return {
        isValid: false,
        error: `Image must be at least ${IMAGE_CONFIG.MIN_DIMENSIONS.width}x${IMAGE_CONFIG.MIN_DIMENSIONS.height} pixels for good quality.`
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

export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Invalid image file'))
    }

    img.src = objectUrl
  })
}

export const compressImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const options = {
    maxSizeMB: IMAGE_CONFIG.COMPRESSION_MAX_SIZE_MB,
    maxWidthOrHeight: IMAGE_CONFIG.COMPRESSION_MAX_WIDTH_HEIGHT,
    useWebWorker: true,
    quality: IMAGE_CONFIG.COMPRESSION_QUALITY,
    onProgress
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Error compressing image:', error)
    return file // Return original file if compression fails
  }
}

export const getCroppedImg = (
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> => {
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
