import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const Navbar = () => {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // On Login, SignUp, and Raah portal screens, dedicated layouts handle their own navigation
  if (['/login', '/signup', '/dashboard', '/assessment', '/results', '/explore', '/saved', '/profile'].includes(location.pathname)) {
    return null
  }

  const handleLogout = async () => {
    try {
      const { error } = await logout()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Logged out successfully')
        navigate('/login')
      }
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#c7c4d8]/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to={user ? '/dashboard' : '/login'}
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <img
            src="/logo.png"
            alt="Raah Logo"
            className="w-10 h-10 rounded-xl object-contain bg-white shadow-xs p-0.5 border border-[#c7c4d8]/70 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[#131b2e] flex items-center gap-2">
              Raah
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#ffddb8] text-[#855300] border border-[#fea619]/40">
                Student Portal
              </span>
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#4f46e5]">dashboard</span>
                Dashboard
              </Link>

              <div className="flex items-center gap-2.5 pl-2 border-l border-[#c7c4d8]/70">
                <span className="hidden md:inline-block text-xs font-semibold text-[#131b2e] max-w-[120px] truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-[#777587] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#3525cd] shadow-xs transition-all duration-150"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
