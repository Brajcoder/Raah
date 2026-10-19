import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleAuthButton } from '../components/GoogleAuthButton'
import { ButtonSpinner } from '../components/ButtonSpinner'
import toast from 'react-hot-toast'

export const Login = () => {
  const { loginWithEmail, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || '/dashboard'

  const handleGuestLogin = () => {
    loginAsGuest()
    toast.success('Welcome to Raah Student Portal!')
    navigate(from, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await loginWithEmail(cleanEmail, password)

      if (error) {
        let friendlyMsg = error.message
        const lowerMsg = (error.message || '').toLowerCase()

        if (lowerMsg.includes('invalid login credentials')) {
          friendlyMsg = 'Invalid email or password. Please verify your credentials and try again.'
        } else if (lowerMsg.includes('email not confirmed')) {
          friendlyMsg =
            'Your email address has not been confirmed yet. Please verify your email with the confirmation code.'
        } else if (
          lowerMsg.includes('too many requests') ||
          lowerMsg.includes('rate limit') ||
          error.status === 429
        ) {
          friendlyMsg =
            'Too many failed attempts. Please wait a few minutes before trying again for security.'
        }

        setErrorMessage(friendlyMsg)
        toast.error(friendlyMsg)
        setLoading(false)
        return
      }

      if (data?.user) {
        toast.success('Signed in successfully!')
        navigate(from, { replace: true })
      }
    } catch {
      const fallback = 'An unexpected connection error occurred. Please try again.'
      setErrorMessage(fallback)
      toast.error(fallback)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf8ff] text-[#131b2e] antialiased selection:bg-[#e2dfff] selection:text-[#0f0069]">
      {/* ================= LEFT COLUMN: Brand Showcase ================= */}
      <section className="relative hidden lg:flex lg:w-[48%] xl:w-[46%] bg-gradient-to-br from-[#4338CA] via-[#4F46E5] to-[#312E81] text-white p-10 xl:p-14 flex-col justify-between overflow-hidden">
        {/* Subtle geometric grid backdrop & ambient lights */}
        <div className="absolute inset-0 hero-grid-pattern opacity-60 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Raah Logo"
            className="w-12 h-12 rounded-2xl object-contain bg-white shadow-md p-1 border border-white/20"
          />
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white block">Raah</span>
            <span className="text-[10px] text-[#ffddb8] font-bold tracking-wider block uppercase">
              Explore • Discover • Your Path
            </span>
          </div>
        </div>

        {/* Center Hero Showcase: Value Proposition & Feature Chips */}
        <div className="relative z-10 my-auto py-10 space-y-8">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span>Secure Student Authentication</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-lg">
            Discover your verified career trajectory through scientific self-discovery.
          </h1>

          {/* Feature Pill Cluster */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[#6ffbbe] text-base">psychology</span>
              <span>Holland RIASEC Assessment</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[#ffddb8] text-base">bolt</span>
              <span>AI-Powered Career Matches</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[#c3c0ff] text-base">route</span>
              <span>Skill Roadmaps</span>
            </div>
          </div>

          {/* Clean Info Feature Card */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white max-w-lg">
            <div className="flex items-center gap-2.5 text-[#ffddb8] mb-2 font-semibold text-sm">
              <span className="material-symbols-outlined text-lg">verified</span>
              <span>Verified Educational Guidance</span>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed">
              Log in to continue your personalized RIASEC evaluation, review customized recommendations, and access academic course pathways.
            </p>
          </div>
        </div>

        {/* Institutional Compliance Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#c3c0ff] border-t border-white/10 pt-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>256-bit SSL &amp; Privacy Compliant</span>
          </div>
          <span className="opacity-80">Raah Student Portal</span>
        </div>
      </section>

      {/* ================= RIGHT COLUMN: Authentication Canvas ================= */}
      <section className="relative flex-1 flex flex-col justify-between bg-white p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen overflow-y-auto">
        {/* Ambient Background Raah Logo Watermark & Glow */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
          <div className="absolute w-[800px] h-[800px] sm:w-[950px] sm:h-[950px] bg-gradient-to-tr from-[#4f46e5]/7 via-[#fea619]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
          <img
            src="/logo.png"
            alt=""
            className="w-[620px] sm:w-[780px] md:w-[880px] lg:w-[980px] xl:w-[1080px] max-w-none opacity-[0.08] object-contain transition-all duration-700"
          />
        </div>

        {/* Top Utility Bar */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <div className="flex lg:hidden items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Raah Logo"
              className="w-9 h-9 rounded-xl object-contain bg-white shadow-xs p-0.5 border border-[#c7c4d8]"
            />
            <span className="text-lg font-bold text-[#131b2e]">Raah</span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5 text-sm text-[#464555]">
            <span>Don&apos;t have an account?</span>
            <Link
              to="/signup"
              className="font-semibold text-[#4f46e5] hover:text-[#3525cd] transition-colors underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Main Login Form Container */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f3ff] text-[#4f46e5] text-xs font-semibold mb-3 border border-[#c7c4d8]/40">
              <span className="material-symbols-outlined text-sm">school</span>
              <span>Student Portal Gateway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#464555] mt-2">
              Log in to access your student dashboard and career pathway assessments.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-in fade-in">
              <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Social Auth */}
          <div className="mb-6">
            <GoogleAuthButton text="Continue with Google" />
          </div>

          {/* Horizontal Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-[#c7c4d8]/60" />
            <span className="bg-white px-3 text-xs font-semibold text-[#777587]">
              or log in with email
            </span>
          </div>

          {/* Credentials Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                className="block text-sm text-[#131b2e] font-semibold mb-1.5"
                htmlFor="student-email"
              >
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] text-sm placeholder-[#777587]/60 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/15 transition-all outline-none"
                  id="student-email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-sm text-[#131b2e] font-semibold"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-xs text-[#4f46e5] font-semibold hover:text-[#3525cd] transition-colors"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-11 py-3 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] text-sm placeholder-[#777587]/60 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/15 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#131b2e] transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  className="w-4 h-4 rounded text-[#4f46e5] border-[#c7c4d8] focus:ring-[#4f46e5] focus:ring-offset-0 cursor-pointer"
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-xs sm:text-sm text-[#464555] font-medium">
                  Remember me on this device
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#3525cd] shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ButtonSpinner size="sm" className="text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>

            {/* Quick Demo Student Access Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff] hover:bg-[#eaedff] text-[#4f46e5] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">badge</span>
                <span>Quick Demo Sign-In (Explore Portal)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Footer */}
        <footer className="relative z-10 w-full max-w-md mx-auto pt-6 border-t border-[#c7c4d8]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-[#777587]">
            <span className="material-symbols-outlined text-lg text-[#006e4b]">lock_clock</span>
            <span className="text-xs text-[#464555]">
              Protected with 256-bit SSL encryption.
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#777587]">
            <a className="hover:text-[#4f46e5] transition-colors" href="#privacy">
              Privacy
            </a>
            <span>•</span>
            <a className="hover:text-[#4f46e5] transition-colors" href="#terms">
              Terms
            </a>
          </div>
        </footer>
      </section>
    </div>
  )
}
