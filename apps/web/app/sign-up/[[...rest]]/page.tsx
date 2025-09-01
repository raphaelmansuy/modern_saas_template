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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl w-full">
          {/* Mobile-first: Show value prop at top on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">

            {/* Left side - Value Proposition */}
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm w-fit">
                  ✨ Start your free trial today
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Join the
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block lg:inline">
                    SaaS Revolution
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Create your account and unlock the full potential of our platform.
                </p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Free 14-day trial</h3>
                    <p className="text-sm lg:text-base text-gray-600">No credit card required to get started</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <RocketLaunchIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Quick setup</h3>
                    <p className="text-sm lg:text-base text-gray-600">Get up and running in under 5 minutes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <SparklesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Premium features</h3>
                    <p className="text-sm lg:text-base text-gray-600">Access all features from day one</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-gray-200/50 shadow-sm">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">What you&apos;ll get:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm lg:text-base">Complete authentication system</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm lg:text-base">Payment processing with Stripe</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm lg:text-base">Modern UI components</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm lg:text-base">Database integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm lg:text-base">Admin dashboard</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Sign Up Form */}
            <div className="order-1 lg:order-2 w-full max-w-lg mx-auto lg:mx-0">
              <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden">
                <CardHeader className="space-y-2 text-center pb-6 pt-8 px-6 lg:px-8">
                  <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    Start your journey with us today
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 lg:px-8 pb-8">
                  <SignUp
                    path="/sign-up"
                    routing="path"
                    signInUrl="/sign-in"
                    redirectUrl="/dashboard"
                    signInFallbackRedirectUrl="/"
                    signUpFallbackRedirectUrl="/dashboard"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full text-base lg:text-lg h-12',
                        card: 'shadow-none p-8 bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 w-full rounded-lg font-medium text-gray-700 h-11',
                        formFieldInput: 'border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg px-4 py-3 text-base transition-all duration-200 placeholder:text-gray-400',
                        formFieldLabel: 'text-gray-700 font-semibold mb-3 block text-sm lg:text-base',
                        formFieldInputGroup: 'mb-6',
                        footerActionLink: 'text-green-600 hover:text-green-700 font-semibold transition-colors',
                        dividerLine: 'bg-gray-200',
                        dividerText: 'text-gray-500 font-medium',
                        form: 'space-y-6',
                        socialButtons: 'grid grid-cols-1 gap-4',
                        socialButtonsBlockButton__google: 'bg-white hover:bg-gray-50 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200',
                        socialButtonsBlockButton__github: 'bg-white hover:bg-gray-50 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200',
                        socialButtonsBlockButtonText: 'font-semibold text-gray-700',
                        formField: 'space-y-3',
                        formButtonReset: 'text-green-600 hover:text-green-700 font-semibold transition-colors',
                        identityPreviewEditButton: 'text-green-600 hover:text-green-700 font-medium',
                        alert: 'bg-red-50 border-2 border-red-200 text-red-700 rounded-lg p-5 mb-6',
                        alertText: 'text-sm font-medium',
                        otpCodeFieldInput: 'border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center text-xl font-mono tracking-widest px-4 py-3 rounded-lg',
                        phoneInputBox: 'border-2 border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 px-4 py-3 rounded-lg',
                        selectButton: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-3 transition-all duration-200',
                        selectButton__open: 'border-green-500 bg-green-50',
                        selectOptionsContainer: 'border-2 border-gray-200 rounded-lg shadow-xl bg-white mt-2',
                        selectOption: 'hover:bg-gray-50 px-4 py-3 transition-colors',
                        selectOption__selected: 'bg-green-50 text-green-700 font-medium',
                        verificationLinkStatusText: 'text-gray-600 font-medium',
                        verificationLinkStatusText__expired: 'text-red-600 font-medium',
                        verificationLinkStatusText__verified: 'text-green-600 font-medium',
                        verificationLinkStatusText__failed: 'text-red-600 font-medium',
                        formContainer: 'space-y-6',
                        formFieldRow: 'mb-5',
                        formFieldHint: 'text-sm text-gray-500 mt-2 font-medium',
                        formFieldError: 'text-sm text-red-600 mt-2 font-medium',
                        formFieldSuccess: 'text-sm text-green-600 mt-2 font-medium',
                        footer: 'mt-8 pt-6 border-t-2 border-gray-100',
                        footerAction: 'text-center',
                        footerActionText: 'text-sm text-gray-600',
                        footerActionLink: 'text-green-600 hover:text-green-700 font-semibold ml-1 transition-colors',
                        rootBox: 'w-full',
                        cardBox: 'w-full space-y-6',
                        pageScrollBox: 'w-full',
                        page: 'w-full min-h-0',
                        scrollBox: 'w-full',
                      },
                      layout: {
                        socialButtonsPlacement: 'bottom',
                        socialButtonsVariant: 'blockButton',
                        showOptionalFields: false,
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
                    className="text-green-600 hover:text-green-700 font-semibold transition-colors underline underline-offset-2"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}