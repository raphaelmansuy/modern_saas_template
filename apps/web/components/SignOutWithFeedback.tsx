'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useToast } from '@/components/Toast'

export function SignOutWithFeedback() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { signOut } = useClerk()
  const { addToast } = useToast()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setShowConfirm(false)

    try {
      await signOut()
      addToast('You have been successfully signed out.', 'success')
    } catch (error) {
      console.error('Error signing out:', error)
      addToast('There was an error signing out. Please try again.', 'error')
      setIsSigningOut(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Sign Out
              </h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSigningOut}
            >
              Cancel
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing Out...
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSigningOut}
    >
      {isSigningOut ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Signing Out...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </>
      )}
    </button>
  )
}
