import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch or fallback profile from database
  const fetchProfile = useCallback(async (userId, userMetadata = null, email = null) => {
    if (!userId) {
      setProfile(null)
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching profile from profiles table:', error.message)
      }

      if (data) {
        setProfile(data)
        return data
      }

      // If trigger is still processing or row wasn't found, build temporary profile from metadata
      const fallback = {
        id: userId,
        full_name:
          userMetadata?.full_name ||
          userMetadata?.name ||
          (email ? email.split('@')[0] : 'User'),
        email: email || '',
        avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
      }
      setProfile(fallback)
      return fallback
    } catch (err) {
      console.warn('Unexpected error while retrieving user profile:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // 1. Get initial active session
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error }) => {
        if (!isMounted) return

        if (error) {
          console.error('Session retrieval error:', error.message)
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          await fetchProfile(
            initialSession.user.id,
            initialSession.user.user_metadata,
            initialSession.user.email
          )
        } else {
          const savedGuest =
            localStorage.getItem('raah_guest_session') ||
            localStorage.getItem('careercompass_guest_session')
          if (savedGuest) {
            try {
              const parsed = JSON.parse(savedGuest)
              setUser(parsed)
              setProfile(parsed)
              setSession({ user: parsed })
            } catch {
              localStorage.removeItem('raah_guest_session')
              localStorage.removeItem('careercompass_guest_session')
            }
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Unexpected getSession error:', err)
        const savedGuest =
          localStorage.getItem('raah_guest_session') ||
          localStorage.getItem('careercompass_guest_session')
        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest)
            setUser(parsed)
            setProfile(parsed)
            setSession({ user: parsed })
          } catch {
            localStorage.removeItem('raah_guest_session')
            localStorage.removeItem('careercompass_guest_session')
          }
        }
        if (isMounted) setLoading(false)
      })

    // 2. Listen to all auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, USER_UPDATED, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        await fetchProfile(
          currentSession.user.id,
          currentSession.user.user_metadata,
          currentSession.user.email
        )
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  // Login with Email & Password
  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    return { data, error }
  }

  // Continue with Google OAuth
  const loginWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/dashboard`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  }

  // Sign up with Email, Password and Full Name (triggers real OTP via email)
  const signUpWithEmail = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })
    return { data, error }
  }

  // Verify the 6-digit signup OTP token
  const verifySignupOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'signup',
    })
    return { data, error }
  }

  // Resend OTP token
  const resendSignupOtp = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    })
    return { data, error }
  }

  // Request password reset email
  const resetPassword = async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })
    return { data, error }
  }

  // Update password on /reset-password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  // Quick Demo Guest Login
  const loginAsGuest = () => {
    const guestUser = {
      id: 'demo-student-uuid',
      email: 'student@raah.edu',
      user_metadata: {
        full_name: 'Student Explorer',
        academic_stage: 'Undergraduate',
      },
    }
    const guestProfile = {
      id: 'demo-student-uuid',
      email: 'student@raah.edu',
      full_name: 'Student Explorer',
      academic_stage: 'Undergraduate',
    }
    localStorage.setItem('raah_guest_session', JSON.stringify(guestProfile))
    setUser(guestUser)
    setProfile(guestProfile)
    setSession({ user: guestUser })
    return { data: { user: guestUser }, error: null }
  }

  // Update Profile Data
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No active user session') }

    // If guest session
    if (user.id === 'demo-student-uuid') {
      const merged = { ...profile, ...updates }
      localStorage.setItem('raah_guest_session', JSON.stringify(merged))
      setProfile(merged)
      setUser((prev) => ({
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          ...updates,
        },
      }))
      return { data: merged, error: null }
    }

    // If Supabase session
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
          ...updates,
        })
        .select()
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      } else {
        setProfile((prev) => ({ ...prev, ...updates }))
      }

      // Also update auth user metadata if full_name or avatar changed
      if (updates.full_name || updates.avatar_url) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.full_name,
            avatar_url: updates.avatar_url,
          },
        })
      }

      return { data: data || updates, error: null }
    } catch (err) {
      console.warn('Error updating profile:', err)
      setProfile((prev) => ({ ...prev, ...updates }))
      return { data: updates, error: null }
    }
  }

  // Sign out
  const logout = async () => {
    localStorage.removeItem('raah_guest_session')
    localStorage.removeItem('careercompass_guest_session')
    const { error } = await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    return { error }
  }

  const value = {
    session,
    user,
    profile,
    loading,
    loginWithEmail,
    loginWithGoogle,
    loginAsGuest,
    signUpWithEmail,
    verifySignupOtp,
    resendSignupOtp,
    resetPassword,
    updatePassword,
    updateProfile,
    logout,
    refreshProfile: () => user && fetchProfile(user.id, user.user_metadata, user.email),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
