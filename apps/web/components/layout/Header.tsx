'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UserButton, useUser, User } from '@clerk/nextjs'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavigationMenu } from '@/components/navigation/NavigationMenu'
import { MobileNavigation } from '@/components/navigation/MobileNavigation'

interface HeaderProps {
  user?: User
}

export function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isLoaded, isSignedIn } = useUser()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SaaS Starter</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isLoaded && isSignedIn && (
            <nav id="navigation" className="hidden md:flex items-center space-x-8">
              <NavigationMenu />
            </nav>
          )}

          {/* User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {isLoaded && isSignedIn && <UserButton />}
            {isLoaded && isSignedIn && (
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && isLoaded && isSignedIn && (
        <MobileNavigation onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  )
}
