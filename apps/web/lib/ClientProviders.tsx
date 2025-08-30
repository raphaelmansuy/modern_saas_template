'use client'

import { ClerkProvider } from '@clerk/nextjs'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}
