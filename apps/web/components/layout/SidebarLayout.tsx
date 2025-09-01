'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Sidebar - Mobile responsive */}
        <aside className="w-full md:w-64 md:mr-8 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 md:sticky md:top-24">
            {sidebar}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
