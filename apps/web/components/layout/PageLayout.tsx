'use client'

import { Header } from './Header'
import { Breadcrumb } from '../navigation/Breadcrumb'
import { Footer } from './Footer'
import { BreadcrumbItem } from '../../lib/store/navigation'

interface PageLayoutProps {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function PageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  children
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

        {(title || description || actions) && (
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-2 text-lg text-gray-600">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
