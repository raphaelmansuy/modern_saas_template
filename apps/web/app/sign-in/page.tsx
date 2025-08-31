import { SignIn } from '@clerk/nextjs'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui'
import { Badge } from '../../components/ui/badge'
import { ShieldCheckIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function SignInPage() {
  return (
    <PageLayout
      title="Welcome Back"
      description="Sign in to your account to continue"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">
                🚀 Trusted by 10,000+ users
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
                  SaaS Starter
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Continue building amazing products with our comprehensive platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                  <p className="text-gray-600">Enterprise-grade security for your peace of mind</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <StarIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Premium Features</h3>
                  <p className="text-gray-600">Access to all premium features and integrations</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Community Driven</h3>
                  <p className="text-gray-600">Join thousands of developers building together</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign In Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SignIn
                  path="/sign-in"
                  routing="path"
                  signUpUrl="/sign-up"
                  redirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md',
                      card: 'shadow-none p-0',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 transition-colors',
                      formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                      footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
                      dividerLine: 'bg-gray-200',
                      dividerText: 'text-gray-500',
                    }
                  }}
                />
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
