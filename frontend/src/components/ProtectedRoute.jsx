import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ButtonSpinner } from './ButtonSpinner'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <ButtonSpinner size="lg" className="text-indigo-500" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Authenticating session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to /login but preserve the attempted URL to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
