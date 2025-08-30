import { useState, useEffect } from 'react'
import { MESSAGE_TIMEOUT } from '../utils/constants'

export type MessageType = 'success' | 'error' | 'info' | 'warning'

export interface Message {
  type: MessageType
  text: string
}

export const useMessage = () => {
  const [message, setMessage] = useState<Message | null>(null)

  // Clear messages after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), MESSAGE_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [message])

  const showMessage = (type: MessageType, text: string) => {
    setMessage({ type, text })
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return {
    message,
    showMessage,
    clearMessage
  }
}
