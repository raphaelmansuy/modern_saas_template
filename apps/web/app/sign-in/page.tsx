import { SignIn } from '@clerk/nextjs'
import { PageLayout } from '../../components/layout/PageLayout'

export default function SignInPage() {
  return (
    <PageLayout
      title="Welcome Back"
      description="Sign in to your account to continue"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
                card: 'shadow-none p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
              }
            }}
          />
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
