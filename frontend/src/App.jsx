import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'

import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { TakeAssessment } from './pages/TakeAssessment'
import { MyResults } from './pages/MyResults'
import { ExploreCareers } from './pages/ExploreCareers'
import { SavedCareers } from './pages/SavedCareers'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-sans selection:bg-[#e2dfff] selection:text-[#0f0069]">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Main App Routes */}
          <main className="flex-1">
            <Routes>
              {/* Home redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Public Routes (Logged-in users redirected to /dashboard) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />

              {/* Reset Password Route (Accessible from email reset link callback) */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Student Portal Routes (Requires active session) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <ProtectedRoute>
                    <TakeAssessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <MyResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <ExploreCareers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedCareers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4500,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                padding: '10px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0f172a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#0f172a',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
