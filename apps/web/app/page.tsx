import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { SignOutWithFeedback } from '../components/SignOutWithFeedback'
import { PageLayout } from '../components/layout/PageLayout'
import { Button } from '../components/ui'

export default function Home() {
  return (
    <PageLayout
      title="Welcome to SaaS Starter"
      description="A modern SaaS application built with Next.js, Hono, and more."
    >
      <div className="text-center">
        <SignedOut>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <Button size="lg">
                Sign In
              </Button>
            </SignInButton>
            <div>
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            <p className="text-lg text-gray-600">
              Welcome back! You're successfully signed in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Browse Products
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg">
                  My Profile
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="secondary" size="lg">
                  Admin Panel
                </Button>
              </Link>
            </div>
            <div className="pt-4">
              <SignOutWithFeedback />
            </div>
          </div>
        </SignedIn>
      </div>
    </PageLayout>
  )
}
