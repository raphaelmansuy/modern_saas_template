import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
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
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
