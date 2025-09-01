import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { SignOutWithFeedback } from '@/components/SignOutWithFeedback'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CheckCircleIcon, StarIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <PageLayout
      title="Welcome to SaaS Starter"
      description="A modern SaaS application built with Next.js, Hono, and more."
    >
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 Now in Beta
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}SaaS Products
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A complete starter kit with authentication, payments, and modern UI components.
              Launch your next SaaS application in minutes, not months.
            </p>

            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Get Started Free
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </SignedIn>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built with modern technologies and best practices for scalable SaaS applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Secure Auth</CardTitle>
                  <CardDescription>
                    Enterprise-grade authentication with Clerk
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Payment Ready</CardTitle>
                  <CardDescription>
                    Stripe integration for seamless transactions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <StarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Modern UI</CardTitle>
                  <CardDescription>
                    Beautiful components with Tailwind CSS
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <UsersIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Team Ready</CardTitle>
                  <CardDescription>
                    Built for collaboration and scaling
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of developers who have already launched their SaaS applications.
            </p>

            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Start Building Today
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Access Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Complete Profile
                  </Button>
                </Link>
                <div className="pt-4">
                  <SignOutWithFeedback />
                </div>
              </div>
            </SignedIn>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
