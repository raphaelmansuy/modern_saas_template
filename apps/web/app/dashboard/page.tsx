'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'
import { useToast } from '../../components/Toast'

export default function Dashboard() {
  const { addToast } = useToast()

  useEffect(() => {
    // Show welcome message when user first arrives at dashboard
    const timer = setTimeout(() => {
      addToast('Welcome back! You have successfully signed in.', 'success')
    }, 500)

    return () => clearTimeout(timer)
  }, [addToast])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton />
      </div>
      <p className="mb-4">Welcome to your SaaS dashboard!</p>
      <div className="space-x-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        <Link href="/products" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Browse Products</Link>
        <Link href="/profile" className="bg-blue-500 text-white px-4 py-2 rounded">My Profile</Link>
        <Link href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded">Admin Panel</Link>
      </div>
    </div>
  )
}
