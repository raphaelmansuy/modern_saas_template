'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { BreadcrumbItem } from '@/lib/store/navigation'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />}
            {item.href ? (
              <Link
                href={item.href}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
