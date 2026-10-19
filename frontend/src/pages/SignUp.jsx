import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleAuthButton } from '../components/GoogleAuthButton'
import { ButtonSpinner } from '../components/ButtonSpinner'
import toast from 'react-hot-toast'

// Helper to evaluate password strength
const evaluatePasswordStrength = (pass) => {
  let score = 0
  if (!pass) return { score: 0, label: 'Enter a secure password', color: 'bg-[#c7c4d8]' }
  if (pass.length >= 8) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[A-Z]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 12) score += 1

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak password', color: 'bg-red-500' }
    case 2:
      return { score: 2, label: 'Fair password', color: 'bg-amber-500' }
    case 3:
      return { score: 3, label: 'Good password', color: 'bg-blue-500' }
    case 4:
      return { score: 4, label: 'Strong & secure password', color: 'bg-emerald-500' }
    default:
      return { score: 0, label: 'Enter a secure password', color: 'bg-[#c7c4d8]' }
  }
}

export const SignUp = () => {
  const { signUpWithEmail, verifySignupOtp, resendSignupOtp } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [academicStage, setAcademicStage] = useState('Undergraduate')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [subscribeNews, setSubscribeNews] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [otpToken, setOtpToken] = useState('')

  // Flow step: 'form' | 'otp'
  const [step, setStep] = useState('form')

  // Loading & status
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Resend cooldown timer (30 seconds)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [countdown])

  const strength = evaluatePasswordStrength(password)

  // Step 1: Initial Sign Up
  const handleInitialSignUp = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanName = fullName.trim()
    const cleanEmail = email.trim()

    if (!cleanName) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUpWithEmail(cleanEmail, password, cleanName)

      if (error) {
        let msg = error.message
        const lower = msg.toLowerCase()
        if (lower.includes('already registered') || lower.includes('already exists')) {
          msg = 'An account with this email address already exists. Please sign in instead.'
        } else if (lower.includes('rate limit') || error.status === 429) {
          msg = 'Rate limit exceeded. Please wait a few moments before trying again.'
        }
        setErrorMessage(msg)
        toast.error(msg)
        setLoading(false)
        return
      }

      if (data?.session) {
        toast.success('Account created successfully! Welcome to Raah.')
        navigate('/dashboard', { replace: true })
        return
      }

      setStep('otp')
      setCountdown(30)
      toast.success('Verification code sent to your email!')
    } catch {
      const fallback = 'An unexpected connection error occurred. Please try again.'
      setErrorMessage(fallback)
      toast.error(fallback)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanToken = otpToken.trim()
    if (!cleanToken || cleanToken.length < 6) {
      setErrorMessage('Please enter the full 6-digit confirmation code.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await verifySignupOtp(email.trim(), cleanToken)

      if (error) {
        let msg = error.message
        const lower = msg.toLowerCase()
        if (lower.includes('token is invalid') || lower.includes('expired')) {
          msg = 'The verification code entered is invalid or has expired. Please check your email or request a new one.'
        }
        setErrorMessage(msg)
        toast.error(msg)
        setLoading(false)
        return
      }

      if (data?.session || data?.user) {
        toast.success('Email verified successfully! Welcome to Raah.')
        navigate('/dashboard', { replace: true })
      }
    } catch {
      const fallback = 'Failed to verify code. Please check your internet connection.'
      setErrorMessage(fallback)
      toast.error(fallback)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return

    setResending(true)
    setErrorMessage('')

    try {
      const { error } = await resendSignupOtp(email.trim())
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('A new 6-digit code has been sent to your email.')
        setCountdown(45)
      }
    } catch {
      toast.error('Failed to resend code. Please wait a moment and try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf8ff] text-[#131b2e] antialiased selection:bg-[#e2dfff] selection:text-[#0f0069]">
      {/* ================= LEFT COLUMN: Career Discovery Value Proposition ================= */}
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

        {/* Center Content: Headline & Key Milestones */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-6">
            <span className="material-symbols-outlined text-[#ffddb8] text-sm">stars</span>
            <span>Student Career Intelligence</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-lg">
            Your potential, mapped. Discover career pathways you&apos;ll{' '}
            <span className="text-[#ffddb8] underline decoration-[#ffddb8]/60 decoration-wavy decoration-2">
              excel in
            </span>
            .
          </h1>

          <p className="mt-4 text-sm text-[#e2e7ff] leading-relaxed max-w-md">
            Scientific self-discovery to explore academic paths, decode your strengths, and build career-ready skills.
          </p>

          {/* Key Milestones */}
          <div className="mt-8 space-y-3.5 max-w-md">
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/15 hover:bg-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-[#ffddb8] shrink-0 border border-white/10">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Holland RIASEC Assessment</h3>
                <p className="text-xs text-[#dad7ff] mt-0.5">
                  Validated interest assessment adapted specifically for students and young professionals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/15 hover:bg-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-[#6ffbbe] shrink-0 border border-white/10">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Career Compatibility Scoring</h3>
                <p className="text-xs text-[#dad7ff] mt-0.5">
                  Match your cognitive profile with hundreds of career trajectories and industry domains.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/15 hover:bg-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-[#c3c0ff] shrink-0 border border-white/10">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Customized Roadmaps</h3>
                <p className="text-xs text-[#dad7ff] mt-0.5">
                  Clear milestones for degree specializations, certifications, and portfolio projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-[#c3c0ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">security</span>
            <span>256-bit SSL Protected</span>
          </div>
          <span className="opacity-80">Raah Student Portal</span>
        </div>
      </section>

      {/* ================= RIGHT COLUMN: Registration Form Canvas ================= */}
      <section className="relative flex-1 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen overflow-y-auto">
        {/* Ambient Background Raah Logo Watermark & Glow */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
          <div className="absolute w-[800px] h-[800px] sm:w-[950px] sm:h-[950px] bg-gradient-to-tr from-[#4f46e5]/7 via-[#fea619]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
          <img
            src="/logo.png"
            alt=""
            className="w-[620px] sm:w-[780px] md:w-[880px] lg:w-[980px] xl:w-[1080px] max-w-none opacity-[0.08] object-contain transition-all duration-700"
          />
        </div>

        {/* Top Navigation Bar: Sign In Link */}
        <div className="relative z-10 flex justify-between items-center w-full max-w-lg mx-auto mb-6">
          <div className="flex lg:hidden items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Raah Logo"
              className="w-9 h-9 rounded-xl object-contain bg-white shadow-xs p-0.5 border border-[#c7c4d8]"
            />
            <span className="text-lg font-bold text-[#131b2e]">Raah</span>
          </div>
          <div className="hidden lg:block" />

          <div className="text-sm text-[#464555]">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="font-bold text-[#4f46e5] hover:text-[#3525cd] ml-1.5 transition-colors underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Main Content Form */}
        <div className="relative z-10 w-full max-w-lg mx-auto my-auto py-2">
          {/* STEP 1: Registration Form */}
          {step === 'form' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#eaedff] text-[#4f46e5] text-xs font-semibold">
                    Registration
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl text-[#131b2e] font-extrabold tracking-tight">
                  Create your account
                </h2>
                <p className="mt-1 text-sm text-[#464555]">
                  Start your career discovery journey in less than 2 minutes.
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

              {/* Google Social Action */}
              <div className="mb-5">
                <GoogleAuthButton text="Continue with Google" />
              </div>

              {/* Section Divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="border-t border-[#c7c4d8] w-full" />
                <span className="bg-white px-3 text-xs text-[#777587] font-semibold uppercase tracking-wider">
                  or register with email
                </span>
              </div>

              {/* Form Elements */}
              <form className="space-y-4" onSubmit={handleInitialSignUp}>
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-[#131b2e] mb-1 font-semibold" htmlFor="full-name">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] placeholder-[#777587]/60 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all outline-none"
                      id="full-name"
                      name="full-name"
                      placeholder="Enter your full name"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-[#131b2e] mb-1 font-semibold" htmlFor="student-email">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] placeholder-[#777587]/60 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all outline-none"
                      id="student-email"
                      name="student-email"
                      placeholder="name@example.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Academic Stage Selection */}
                <div>
                  <label className="block text-sm text-[#131b2e] mb-1.5 font-semibold">
                    Current Academic Stage
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['High School', 'Undergraduate', 'Graduate', 'Professional'].map((stage) => {
                      const isSelected = academicStage === stage
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setAcademicStage(stage)}
                          className={`py-2 px-2 rounded-xl border text-center transition-all duration-150 text-xs font-semibold cursor-pointer ${
                            isSelected
                              ? 'border-[#4f46e5] bg-[#eaedff] text-[#4f46e5] shadow-xs ring-1 ring-[#4f46e5]'
                              : 'border-[#c7c4d8] bg-white text-[#464555] hover:bg-[#f2f3ff]'
                          }`}
                        >
                          {stage}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Password with Strength Indicator */}
                <div>
                  <label className="block text-sm text-[#131b2e] mb-1 font-semibold" htmlFor="password">
                    Create Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-11 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] placeholder-[#777587]/60 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all outline-none"
                      id="password"
                      name="password"
                      placeholder="At least 8 characters"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#131b2e] focus:outline-none cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map((barIdx) => (
                        <div
                          key={barIdx}
                          className={`h-full rounded-full transition-colors duration-300 ${
                            strength.score >= barIdx ? strength.color : 'bg-[#c7c4d8]/40'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#777587]">
                      <span>{strength.label}</span>
                      <span>Min 8 characters, 1 number, 1 uppercase</span>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      className="mt-0.5 w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5] border-[#c7c4d8] cursor-pointer"
                      required
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span className="text-xs text-[#464555] leading-tight select-none">
                      I agree to the{' '}
                      <a className="text-[#4f46e5] hover:underline font-medium" href="#terms">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a className="text-[#4f46e5] hover:underline font-medium" href="#privacy">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      className="mt-0.5 w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5] border-[#c7c4d8] cursor-pointer"
                      type="checkbox"
                      checked={subscribeNews}
                      onChange={(e) => setSubscribeNews(e.target.checked)}
                    />
                    <span className="text-xs text-[#464555] leading-tight select-none">
                      Send me occasional career insights and updates. (Optional)
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#3525cd] shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ButtonSpinner size="sm" className="text-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Email Verification OTP Screen */}
          {step === 'otp' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <button
                  onClick={() => setStep('form')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#4f46e5] font-semibold hover:underline mb-3 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Change email address</span>
                </button>
                <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">
                  Verify your email
                </h2>
                <p className="mt-1.5 text-sm text-[#464555]">
                  We sent a 6-digit confirmation code to{' '}
                  <strong className="text-[#131b2e] font-semibold">{email}</strong>. Please enter it
                  below to activate your account.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">
                    error
                  </span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 px-4 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/15 transition-all outline-none"
                    maxLength={6}
                    placeholder="••••••"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ''))}
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#3525cd] shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ButtonSpinner size="sm" className="text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Resend Code */}
                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <p className="text-xs text-[#777587]">
                      Resend code in <span className="font-semibold text-[#131b2e]">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="text-xs font-semibold text-[#4f46e5] hover:underline cursor-pointer disabled:opacity-50"
                      type="button"
                    >
                      {resending ? 'Sending new code...' : 'Didn’t receive the code? Resend OTP'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 w-full max-w-lg mx-auto pt-4 border-t border-[#c7c4d8]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="text-xs text-[#777587]">
            🔒 256-bit Secure Encryption.
          </span>
          <div className="flex items-center gap-3 text-xs text-[#777587]">
            <a className="hover:text-[#4f46e5]" href="#privacy">
              Privacy Policy
            </a>
            <span>•</span>
            <a className="hover:text-[#4f46e5]" href="#terms">
              Terms of Service
            </a>
          </div>
        </footer>
      </section>
    </div>
  )
}
