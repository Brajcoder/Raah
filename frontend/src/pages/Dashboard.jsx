import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PortalLayout } from '../components/PortalLayout'
import { getMe, getDashboard, deleteResult } from '../lib/api'
import toast from 'react-hot-toast'

const TRAIT_NAMES = {
  A: 'Analytical',
  C: 'Creative',
  S: 'Social',
  L: 'Leadership',
  B: 'Hands-on Building',
  O: 'Organized',
}

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState({
    attempts: 0,
    latest: null,
    top_trait: null,
  })
  const [profileData, setProfileData] = useState({
    id: '',
    email: '',
    name: 'Student',
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [meRes, dashRes] = await Promise.allSettled([getMe(), getDashboard()])

      if (meRes.status === 'fulfilled' && meRes.value) {
        setProfileData(meRes.value)
      } else {
        // Fallback to auth user metadata
        const name =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          (user?.email ? user.email.split('@')[0] : 'Student')
        setProfileData({ id: user?.id, email: user?.email, name })
      }

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardData(dashRes.value)
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleDeleteLatest = async (resultId) => {
    if (!resultId) return
    if (!window.confirm('Are you sure you want to delete your latest assessment record?')) return

    try {
      await deleteResult(resultId)
      toast.success('Assessment record deleted.')
      localStorage.removeItem('raah_active_result')
      fetchDashboardData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete assessment.')
    }
  }

  const { attempts, latest, top_trait } = dashboardData
  const topTraitFullName = top_trait ? TRAIT_NAMES[top_trait] || top_trait : null

  return (
    <PortalLayout
      title="Student Dashboard"
      subtitle="Welcome to Raah • Career Intelligence & Guidance Portal"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ================= HERO WELCOME BANNER ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-[2px] text-[#131b2e] p-6 md:p-8 shadow-xs border border-white/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-semibold border border-[#4f46e5]/20">
                <span className="w-2 h-2 rounded-full bg-[#fea619] animate-pulse" />
                <span>AI Guidance Active • Powered by Gemini</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                Welcome back, {profileData.name || 'Student'} 👋
              </h2>
              <p className="text-[#464555] text-xs sm:text-sm leading-relaxed">
                Raah dynamically formulates career scenarios tailored to any academic field you enter. Take an assessment to discover your primary cognitive archetype and realistic career trajectories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-base">quiz</span>
                <span>{attempts > 0 ? 'Explore Another Field' : 'Start First Assessment'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= STAT METRICS GRID ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Assessments */}
          <div className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#777587] font-semibold">Total Assessments</span>
              <div className="w-9 h-9 rounded-xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">assignment</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#131b2e]">{attempts}</div>
            <p className="text-[11px] text-[#777587]">
              {attempts === 0 ? 'No assessments completed yet' : `${attempts} completed profile evaluations`}
            </p>
          </div>

          {/* Card 2: Primary Trait Archetype */}
          <div className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#777587] font-semibold">Primary Trait</span>
              <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">psychology</span>
              </div>
            </div>
            <div className="text-xl font-bold text-[#131b2e] flex items-center gap-2">
              {top_trait ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#eaedff] text-[#3525cd] text-sm font-bold">
                    {top_trait}
                  </span>
                  <span className="text-sm truncate">{topTraitFullName}</span>
                </>
              ) : (
                <span className="text-sm text-[#777587]">Pending Assessment</span>
              )}
            </div>
            <p className="text-[11px] text-[#777587]">
              {top_trait ? 'Calculated from your latest submission' : 'Complete an assessment to reveal'}
            </p>
          </div>

          {/* Card 3: Latest Field Explored */}
          <div className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#777587] font-semibold">Latest Field</span>
              <div className="w-9 h-9 rounded-xl bg-[#fffbeb] text-[#f59e0b] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">school</span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#131b2e] truncate">
              {latest?.field || 'None'}
            </div>
            <p className="text-[11px] text-[#777587]">
              {latest ? 'Most recent discipline guidance' : 'Explore any degree or course'}
            </p>
          </div>
        </section>

        {/* ================= LATEST ASSESSMENT SPOTLIGHT ================= */}
        {latest ? (
          <section className="bg-white/30 backdrop-blur-[2px] border border-white/70 rounded-3xl p-6 sm:p-7 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c7c4d8]/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider">
                  Latest Saved Evaluation
                </span>
                <h3 className="text-lg font-bold text-[#131b2e]">
                  Field: {latest.field}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('raah_active_result', JSON.stringify(latest))
                    navigate('/results')
                  }}
                  className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Full Guidance</span>
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteLatest(latest.id)}
                  className="px-3 py-2 bg-white hover:bg-[#fee2e2] text-[#dc2626] text-xs font-semibold rounded-xl border border-[#fecaca] transition-all flex items-center gap-1 cursor-pointer"
                  title="Delete this result"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            {/* Quick summary snippets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-white/50 border border-white/80 space-y-1.5">
                <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#4f46e5]">summarize</span>
                  AI Profile Synthesis
                </span>
                <p className="text-xs text-[#464555] line-clamp-3 leading-relaxed">
                  {latest.ai?.summary || 'No summary available.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 border border-white/80 space-y-1.5">
                <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#10b981]">workspace_premium</span>
                  Top Career Routes Identified
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(latest.ai?.careers || []).map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#eaedff] text-[#3525cd] text-[11px] font-semibold"
                    >
                      {c.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white/20 backdrop-blur-[2px] border border-dashed border-[#c7c4d8] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <h4 className="text-base font-bold text-[#131b2e]">
              Ready to find your path?
            </h4>
            <p className="text-xs text-[#777587] max-w-sm mx-auto leading-relaxed">
              Type your degree or stream to take a 10-question quiz and receive tailored career advice.
            </p>
            <div className="pt-2">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#3525cd] transition-all"
              >
                <span>Get Started Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  )
}
