import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ButtonSpinner } from '../components/ButtonSpinner'
import toast from 'react-hot-toast'

// Helper for password strength
const evaluatePasswordStrength = (pass) => {
  let score = 0
  if (!pass) return { score: 0, label: 'Enter a secure password', color: 'bg-[#c7c4d8]' }
  if (pass.length >= 8) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[A-Z]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 12) score += 1

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500' }
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500' }
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500' }
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
    default:
      return { score: 0, label: 'Enter a secure password', color: 'bg-[#c7c4d8]' }
  }
}

export const ResetPassword = () => {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = evaluatePasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    try {
      const { error } = await updatePassword(password)

      if (error) {
        setErrorMessage(error.message || 'Failed to update password')
        toast.error(error.message || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Your password has been successfully updated!')

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000)
    } catch {
      const fallback = 'Failed to update password. Please request a new recovery link.'
      setErrorMessage(fallback)
      toast.error(fallback)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#faf8ff] text-[#131b2e] relative overflow-hidden">
      {/* Ambient Background Raah Logo Watermark & Glow (Same as Login page) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
        <div className="absolute w-[800px] h-[800px] sm:w-[950px] sm:h-[950px] bg-gradient-to-tr from-[#4f46e5]/7 via-[#fea619]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
        <img
          src="/logo.png"
          alt=""
          className="w-[620px] sm:w-[780px] md:w-[880px] lg:w-[980px] xl:w-[1080px] max-w-none opacity-[0.08] object-contain transition-all duration-700"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-[#c7c4d8]/70 rounded-2xl p-6 sm:p-8 shadow-xl shadow-[#4f46e5]/5 relative">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6ffbbe]/20 text-[#006e4b] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-[#131b2e] tracking-tight">Password Updated!</h2>
              <p className="text-sm text-[#464555]">
                Your new password has been saved securely. Redirecting you to your student dashboard...
              </p>
              <div className="pt-2 flex justify-center">
                <ButtonSpinner size="sm" className="text-[#4f46e5]" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaedff] text-[#4f46e5] text-xs font-semibold mb-3 border border-[#c3c0ff]/60">
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  <span>Set New Password</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  Update Password
                </h1>
                <p className="mt-2 text-sm text-[#464555]">
                  Please choose a strong, secure password for your student portal
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-[#131b2e] uppercase tracking-wider mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={loading}
                      className="block w-full pl-11 pr-11 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] placeholder-[#777587]/60 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#131b2e] focus:outline-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
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
                      <span>Min 8 chars, 1 number, 1 uppercase</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-[#131b2e] uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">lock_clock</span>
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      disabled={loading}
                      className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#131b2e] placeholder-[#777587]/60 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4f46e5] hover:bg-[#3525cd] text-white text-sm font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <ButtonSpinner size="sm" className="text-white" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4f46e5] hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Back to sign in</span>
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
