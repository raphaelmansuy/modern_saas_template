import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { SignOutWithFeedback } from '../components/SignOutWithFeedback'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SaaS Starter</h1>
        <p className="text-lg mb-8">A modern SaaS application built with Next.js, Hono, and more.</p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <Link href="/sign-up" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Sign Up
          </Link>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                Go to Dashboard
              </Link>
              <Link href="/products" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                Browse Products
              </Link>
              <Link href="/profile" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                My Profile
              </Link>
              <Link href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
                Admin Panel
              </Link>
            </div>
            <SignOutWithFeedback />
          </div>
        </SignedIn>
      </div>
    </main>
  )
}
