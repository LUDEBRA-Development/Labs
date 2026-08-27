import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullScreenSpinner />
  }

  if (!isAuthenticated) {
    // Guarda a dónde iba, para regresarlo ahí después del login.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function FullScreenSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
    </div>
  )
}
