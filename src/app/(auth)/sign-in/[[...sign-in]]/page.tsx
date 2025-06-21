import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to GenPost</h1>
          <p className="mt-2 text-gray-600">
            Sign in to manage your social media presence
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
