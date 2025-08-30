export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 50,
  COMPRESSION_MAX_SIZE_MB: 1,
  COMPRESSION_MAX_WIDTH_HEIGHT: 1024,
  COMPRESSION_QUALITY: 0.8,
  MIN_DIMENSIONS: { width: 100, height: 100 },
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  CROP_ASPECT_RATIO: 1,
  ZOOM: {
    MIN: 0.5,
    MAX: 3,
    STEP: 0.25,
    DEFAULT: 1
  }
} as const

export const UPLOAD_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  PROGRESS_UPDATE_INTERVAL: 200
} as const

export const MESSAGE_TIMEOUT = 5000
