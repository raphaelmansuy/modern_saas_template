import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">
            Join us and start building amazing things
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
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
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
