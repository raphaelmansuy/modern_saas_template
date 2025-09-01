'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ToastProvider } from '@/components/Toast'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </ClerkProvider>
  )
}
