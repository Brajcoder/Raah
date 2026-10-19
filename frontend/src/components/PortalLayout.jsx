import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const PortalLayout = ({ children, title = 'Student Dashboard', subtitle = 'Academic Year 2024–2025 • Guidance Pathway' }) => {
  const { user, profile, logout, refreshProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleLogout = async () => {
    try {
      const { error } = await logout()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed out successfully')
        navigate('/login', { replace: true })
      }
    } catch {
      toast.error('Error signing out')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshProfile()
      toast.success('Database profile data synced')
    } catch {
      toast.error('Failed to sync profile')
    } finally {
      setRefreshing(false)
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'User')
  const displayEmail = profile?.email || user?.email || 'N/A'
  const displayAvatar =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null

  const userInitial = (displayName || 'U')[0].toUpperCase()

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Take Assessment', path: '/assessment', icon: 'quiz', badge: 'Active' },
    { name: 'My Results', path: '/results', icon: 'insights' },
    { name: 'Explore Careers', path: '/explore', icon: 'explore' },
    { name: 'Saved Careers', path: '/saved', icon: 'bookmark' },
    { name: 'Profile & Settings', path: '/profile', icon: 'manage_accounts' },
  ]

  return (
    <div className="min-h-screen text-[#131b2e] bg-[#faf8ff] font-sans antialiased overflow-hidden flex">
      {/* ==================== SIDE NAV BAR ==================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 h-screen w-64 border-r border-[#c7c4d8]/50 bg-white/85 backdrop-blur-md flex flex-col justify-between p-4 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header / Brand */}
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Raah Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white shadow-xs p-0.5 border border-[#c7c4d8]/70 group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="text-lg font-extrabold text-[#131b2e] tracking-tight flex items-center gap-1.5">
                  <span>Raah</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#ffddb8] text-[#855300]">
                    Portal
                  </span>
                </div>
                <div className="text-[10px] font-bold text-[#fea619] tracking-wider uppercase">
                  Explore • Discover
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#777587] hover:bg-[#f2f3ff] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Quick CTA */}
          <div className="px-1 mb-4">
            <Link
              to="/assessment"
              className="w-full py-2.5 px-3 bg-[#4f46e5] hover:bg-[#3525cd] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">quiz</span>
              <span>Take Assessment</span>
            </Link>
          </div>

          {/* Navigation Tab List */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.99] ${
                    isActive
                      ? 'bg-[#eaedff] text-[#4f46e5] font-semibold'
                      : 'text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fea619]/20 text-[#855300]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Guidance Support Card */}
          <div className="mt-6 p-3.5 bg-[#e2dfff]/40 rounded-2xl border border-[#c3c0ff]/50">
            <div className="flex items-center gap-2 mb-1 text-[#3525cd] text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">school</span>
              <span>Advisor Support</span>
            </div>
            <p className="text-[11px] text-[#464555] leading-relaxed mb-2">
              Need guidance understanding your assessment results?
            </p>
            <button
              onClick={() => toast.success('Advisory guidance request submitted.')}
              className="w-full py-1.5 px-3 rounded-lg bg-white text-[#4f46e5] font-semibold text-[11px] border border-[#c7c4d8] hover:bg-[#4f46e5] hover:text-white transition-all cursor-pointer shadow-xs"
            >
              Book Guidance Slot
            </button>
          </div>
        </div>

        {/* Footer User Info & Profile Dashboard Link */}
        <div className="border-t border-[#c7c4d8]/60 pt-3 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] border border-transparent hover:border-[#c3c0ff] transition-all cursor-pointer group"
            title="Open Profile Dashboard & Settings"
          >
            {displayAvatar ? (
              <img
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-[#c7c4d8] flex-shrink-0 group-hover:scale-105 transition-transform"
                src={displayAvatar}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-[#3525cd] transition-colors">
                {userInitial}
              </div>
            )}
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#131b2e] truncate group-hover:text-[#4f46e5] transition-colors">
                {displayName}
              </div>
              <div className="text-[10px] text-[#777587] truncate">{displayEmail}</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#4f46e5] transition-colors">
              settings
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#777587] hover:text-red-600 hover:bg-red-50 transition-colors font-semibold text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* ==================== MAIN APPLICATION CANVAS ==================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Ambient Background Raah Logo Watermark & Glow (Same as Login page) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
          <div className="absolute w-[900px] h-[900px] sm:w-[1100px] sm:h-[1100px] bg-gradient-to-tr from-[#4f46e5]/22 via-[#fea619]/18 to-transparent rounded-full blur-3xl pointer-events-none" />
          <img
            src="/logo.png"
            alt=""
            className="w-[620px] sm:w-[780px] md:w-[880px] lg:w-[980px] xl:w-[1080px] max-w-none opacity-[0.38] object-contain transition-all duration-700"
          />
        </div>

        {/* Top App Bar */}
        <header className="sticky top-0 bg-white/40 backdrop-blur-md border-b border-[#c7c4d8]/40 z-30 flex justify-between items-center w-full px-4 sm:px-6 py-2.5">
          {/* Left: Title & Quick Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#464555] hover:bg-[#f2f3ff] cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#131b2e] tracking-tight">
                {title}
              </h1>
              <p className="text-[11px] text-[#777587] hidden sm:block">
                {subtitle}
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative hidden md:block w-64 lg:w-72 ml-2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777587]">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl bg-[#f2f3ff] border border-[#c7c4d8] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all text-[#131b2e] placeholder-[#777587]/60"
                placeholder="Search careers, skills, or majors..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-[#777587] bg-white rounded border border-[#c7c4d8]">
                  ⌘K
                </kbd>
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl text-[#464555] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              title="Sync profile"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  refreshing ? 'animate-spin text-[#4f46e5]' : ''
                }`}
              >
                sync
              </span>
            </button>

            {/* Top Bar Profile Icon Button */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-[#c7c4d8] hover:bg-[#eaedff] hover:border-[#4f46e5]/40 transition-all cursor-pointer group shadow-2xs"
              title="Open Profile Dashboard & Customization"
            >
              {displayAvatar ? (
                <img
                  alt={displayName}
                  className="w-7 h-7 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  src={displayAvatar}
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs group-hover:bg-[#3525cd] transition-colors">
                  {userInitial}
                </div>
              )}
              <span className="text-xs text-[#131b2e] font-semibold hidden sm:inline group-hover:text-[#4f46e5] transition-colors">
                {displayName.split(' ')[0]}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#4f46e5] transition-colors">
                tune
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
