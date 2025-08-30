import Link from 'next/link'

export const ProfileHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      <Link href="/" className="text-indigo-600 hover:text-indigo-500">
        ← Back to Home
      </Link>
    </div>
  )
}
