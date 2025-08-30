import type { Metadata } from 'next'
import { ClientProviders } from '../lib/ClientProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'SaaS Starter',
  description: 'A starter kit for SaaS applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
