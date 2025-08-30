import { Message } from '../hooks/useMessage'

interface MessageDisplayProps {
  message: Message | null
}

export const MessageDisplay = ({ message }: MessageDisplayProps) => {
  if (!message) return null

  return (
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
  )
}
