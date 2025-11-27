import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: ReactNode
  requireCreator?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireCreator = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, profile, isLoading, isCreator, isAdmin } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size={48} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  // Check creator requirement
  if (requireCreator && !isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Creator Access Required
          </h2>
          <p className="text-gray-600">
            You need to be a creator to access this page.
          </p>
        </div>
      </div>
    )
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Access Required
          </h2>
          <p className="text-gray-600">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
