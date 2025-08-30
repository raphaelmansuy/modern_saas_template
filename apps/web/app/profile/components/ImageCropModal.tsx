import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropModalProps {
  showCropModal: boolean
  previewUrl: string | null
  crop: Crop | undefined
  setCrop: (crop: Crop) => void
  completedCrop: PixelCrop | undefined
  imageDimensions: { width: number; height: number } | null
  zoom: number
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onCropComplete: (crop: PixelCrop) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onApplyCrop: () => Promise<void>
  onCancelCrop: () => void
  isCompressing: boolean
}

export const ImageCropModal = ({
  showCropModal,
  previewUrl,
  crop,
  setCrop,
  completedCrop,
  imageDimensions,
  zoom,
  onImageLoad,
  onCropComplete,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onApplyCrop,
  onCancelCrop,
  isCompressing
}: ImageCropModalProps) => {
  if (!showCropModal) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Crop & Compress Image</h3>
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onZoomOut}
                disabled={zoom <= 0.5}
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
                onClick={onZoomIn}
                disabled={zoom >= 3}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={onZoomReset}
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
                onClick={onCancelCrop}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
                disabled={isCompressing}
              >
                Cancel
              </button>
              <button
                onClick={onApplyCrop}
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
  )
}
