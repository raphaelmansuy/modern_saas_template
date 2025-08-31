'use client'

import { Header } from './Header'
import { Footer } from './Footer'

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sidebar */}
        <aside className="w-64 mr-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            {sidebar}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
