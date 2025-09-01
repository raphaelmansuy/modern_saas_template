import { SignUp } from '@clerk/nextjs'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { CheckCircleIcon, RocketLaunchIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function SignUpPage() {
  return (
    <PageLayout
      title="Create Account"
      description="Join us and start building amazing things"
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Value Proposition */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">
                ✨ Start your free trial today
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900">
                Join the
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block">
                  SaaS Revolution
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Create your account and unlock the full potential of our platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Free 14-day trial</h3>
                  <p className="text-gray-600">No credit card required to get started</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick setup</h3>
                  <p className="text-gray-600">Get up and running in under 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Premium features</h3>
                  <p className="text-gray-600">Access all features from day one</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What you&apos;ll get:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Complete authentication system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Payment processing with Stripe</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Modern UI components</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Database integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Admin dashboard</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Sign Up Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>
                  Start your journey with us today
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SignUp
                  path="/sign-up"
                  routing="path"
                  signInUrl="/sign-in"
                  redirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md',
                      card: 'shadow-none p-0',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 transition-colors',
                      formFieldInput: 'border-gray-300 focus:border-green-500 focus:ring-green-500',
                      footerActionLink: 'text-green-600 hover:text-green-700 font-medium',
                      dividerLine: 'bg-gray-200',
                      dividerText: 'text-gray-500',
                    }
                  }}
                />
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/sign-in"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}