import { SignUp } from '@clerk/nextjs'
import { PageLayout } from '../../components/layout/PageLayout'

export default function SignUpPage() {
  return (
    <PageLayout
      title="Create Account"
      description="Join us and start building amazing things"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-green-500 hover:bg-green-600 text-white',
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
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  )
}