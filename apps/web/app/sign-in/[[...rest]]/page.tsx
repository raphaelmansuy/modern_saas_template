import { SignIn } from '@clerk/nextjs'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { ShieldCheckIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function SignInPage() {
  return (
    <PageLayout
      title="Welcome Back"
      description="Sign in to your account to continue"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl w-full">
          {/* Mobile-first: Show branding at top on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">

            {/* Left side - Branding */}
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm w-fit">
                  🚀 Trusted by 10,000+ users
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Welcome back to
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block lg:inline">
                    SaaS Starter
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Continue building amazing products with our comprehensive platform.
                </p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <ShieldCheckIcon className="w-5 h-5 lg:w-8 lg:h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                    <p className="text-sm lg:text-base text-gray-600">Enterprise-grade security for your peace of mind</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <StarIcon className="w-5 h-5 lg:w-8 lg:h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Premium Features</h3>
                    <p className="text-sm lg:text-base text-gray-600">Access to all premium features and integrations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <UsersIcon className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Community Driven</h3>
                    <p className="text-sm lg:text-base text-gray-600">Join thousands of developers building together</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Sign In Form */}
            <div className="order-1 lg:order-2 w-full max-w-lg mx-auto lg:mx-0">
              <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden">
                <CardHeader className="space-y-2 text-center pb-6 pt-8 px-6 lg:px-8">
                  <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 lg:px-8 pb-8">
                  <SignIn
                    path="/sign-in"
                    routing="path"
                    signUpUrl="/sign-up"
                    redirectUrl="/dashboard"
                    signInFallbackRedirectUrl="/"
                    signUpFallbackRedirectUrl="/sign-up"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full text-base lg:text-lg h-12',
                        card: 'shadow-none p-8 bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 w-full rounded-lg font-medium text-gray-700 h-11',
                        formFieldInput: 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3 text-base transition-all duration-200 placeholder:text-gray-400',
                        formFieldLabel: 'text-gray-700 font-semibold mb-3 block text-sm lg:text-base',
                        formFieldInputGroup: 'mb-6',
                        footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold transition-colors',
                        dividerLine: 'bg-gray-200',
                        dividerText: 'text-gray-500 font-medium',
                        form: 'space-y-6',
                        socialButtons: 'grid grid-cols-1 gap-4',
                        socialButtonsBlockButton__google: 'bg-white hover:bg-gray-50 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200',
                        socialButtonsBlockButton__github: 'bg-white hover:bg-gray-50 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200',
                        socialButtonsBlockButtonText: 'font-semibold text-gray-700',
                        formField: 'space-y-3',
                        formButtonReset: 'text-blue-600 hover:text-blue-700 font-semibold transition-colors',
                        identityPreviewEditButton: 'text-blue-600 hover:text-blue-700 font-medium',
                        alert: 'bg-red-50 border-2 border-red-200 text-red-700 rounded-lg p-5 mb-6',
                        alertText: 'text-sm font-medium',
                        otpCodeFieldInput: 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-center text-xl font-mono tracking-widest px-4 py-3 rounded-lg',
                        phoneInputBox: 'border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-4 py-3 rounded-lg',
                        selectButton: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-3 transition-all duration-200',
                        selectButton__open: 'border-blue-500 bg-blue-50',
                        selectOptionsContainer: 'border-2 border-gray-200 rounded-lg shadow-xl bg-white mt-2',
                        selectOption: 'hover:bg-gray-50 px-4 py-3 transition-colors',
                        selectOption__selected: 'bg-blue-50 text-blue-700 font-medium',
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
                        footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors',
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
                  Don&apos;t have an account?{' '}
                  <a
                    href="/sign-up"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline underline-offset-2"
                  >
                    Create one here
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
