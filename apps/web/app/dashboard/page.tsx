'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton />
      </div>
      <p className="mb-4">Welcome to your SaaS dashboard!</p>
      <div className="space-x-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        <Link href="/profile" className="bg-blue-500 text-white px-4 py-2 rounded">My Profile</Link>
        <Link href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded">Admin Panel</Link>
      </div>
    </div>
  )
}
