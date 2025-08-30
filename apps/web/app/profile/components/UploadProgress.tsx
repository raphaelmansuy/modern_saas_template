interface UploadProgressProps {
  isUploading: boolean
  isCompressing: boolean
  uploadProgress: number
  compressionProgress: number
}

export const UploadProgress = ({
  isUploading,
  isCompressing,
  uploadProgress,
  compressionProgress
}: UploadProgressProps) => {
  if (!isUploading && !isCompressing) return null

  return (
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
  )
}
