import { createFileRoute } from '@tanstack/react-router'
import { OTPVerification } from '@/components/OTPVerification'
import { useConvexAuth } from 'convex/react'
import { useEffect } from 'react'

export const Route = createFileRoute('/verify-otp')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email ? String(search.email) : undefined,
    }
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const { isAuthenticated, isLoading } = useConvexAuth()

  useEffect(() => {
    // If user is already authenticated, redirect to home page
    if (!isLoading && isAuthenticated) {
      window.location.href = '/'
    }
  }, [isAuthenticated, isLoading])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render the component (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return <OTPVerification email={search.email} />
}