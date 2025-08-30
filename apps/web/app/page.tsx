import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SaaS Starter</h1>
        <p className="text-lg mb-8">A modern SaaS application built with Next.js, Hono, and more.</p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-4">Sign In</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link href="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded mr-4">Go to Dashboard</Link>
          <Link href="/profile" className="bg-blue-500 text-white px-4 py-2 rounded mr-4">My Profile</Link>
          <Link href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded mr-4">Admin Panel</Link>
          <SignOutButton>
            <button className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
          </SignOutButton>
        </SignedIn>
      </div>
    </main>
  )
}
