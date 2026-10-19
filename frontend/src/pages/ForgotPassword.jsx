import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ButtonSpinner } from '../components/ButtonSpinner'
import toast from 'react-hot-toast'

export const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid student email address.')
      return
    }

    setLoading(true)

    try {
      const { error } = await resetPassword(cleanEmail)

      if (error) {
        if (error.status === 429) {
          setErrorMessage('Too many requests. Please wait a few minutes before trying again.')
          toast.error('Too many requests. Please wait a few minutes.')
        } else {
          setSubmitted(true)
          toast.success('If an account exists, a recovery link has been sent.')
        }
        setLoading(false)
        return
      }

      setSubmitted(true)
      toast.success('Password recovery email sent!')
    } catch {
      setSubmitted(true)
    } finally {
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
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6ffbbe]/20 text-[#006e4b] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>

              <h2 className="text-2xl font-bold text-[#131b2e] tracking-tight">Check your email</h2>

              <p className="text-sm text-[#464555] max-w-sm mx-auto leading-relaxed">
                If an account matches <strong className="text-[#131b2e]">{email}</strong>, we&apos;ve
                sent a password reset link. Please check your inbox and spam folders.
              </p>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#c7c4d8] hover:bg-[#f2f3ff] text-[#131b2e] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Send to a different email
                </button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#4f46e5] hover:underline transition-colors"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Return to sign in</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaedff] text-[#4f46e5] text-xs font-semibold mb-3 border border-[#c3c0ff]/60">
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  <span>Student Security</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  Reset password
                </h1>
                <p className="mt-2 text-sm text-[#464555]">
                  Enter your student email address to receive secure reset instructions
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
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold text-[#131b2e] uppercase tracking-wider mb-1.5"
                  >
                    Student Email Address
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
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
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Instructions</span>
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
