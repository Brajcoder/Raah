import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PortalLayout } from '../components/PortalLayout'
import { getResults, deleteResult } from '../lib/api'
import toast from 'react-hot-toast'

const TRAIT_METADATA = {
  A: {
    name: 'Analytical',
    desc: 'Data interpretation, research, systematic inquiry, and logical reasoning.',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: 'analytics',
  },
  C: {
    name: 'Creative',
    desc: 'Conceptual innovation, design expression, and out-of-the-box thinking.',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    icon: 'palette',
  },
  S: {
    name: 'Social',
    desc: 'Empathy, mentoring, communication, collaborative teamwork, and human impact.',
    color: '#10b981',
    bgColor: '#ecfdf5',
    icon: 'groups',
  },
  L: {
    name: 'Leadership',
    desc: 'Strategic direction, decisive leadership, initiative, and resource management.',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: 'military_tech',
  },
  B: {
    name: 'Hands-on Building',
    desc: 'Engineering execution, physical prototyping, tooling, and practical construction.',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    icon: 'build',
  },
  O: {
    name: 'Organized',
    desc: 'Operational precision, structured planning, quality governance, and consistency.',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    icon: 'checklist',
  },
}

export const MyResults = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeResult, setActiveResult] = useState(() => {
    // Check route navigation state or local storage cache
    if (location.state?.result) return location.state.result
    try {
      const cached = localStorage.getItem('raah_active_result')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [allResults, setAllResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch past results from server
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getResults()
      .then((data) => {
        if (!isMounted) return
        setAllResults(data || [])
        // If no active result selected yet, take the newest from server
        if (!activeResult && data && data.length > 0) {
          const newest = data[0]
          setActiveResult({
            id: newest.id,
            field: newest.field,
            profile: newest.scores || [],
            ai: newest.ai,
            created_at: newest.created_at,
          })
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server results:', err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (idToDelete) => {
    if (!idToDelete) return
    if (!window.confirm('Are you sure you want to delete this career guidance result?')) return

    setIsDeleting(true)
    try {
      await deleteResult(idToDelete)
      toast.success('Assessment result deleted.')
      localStorage.removeItem('raah_active_result')
      
      const updated = allResults.filter((r) => r.id !== idToDelete)
      setAllResults(updated)

      if (updated.length > 0) {
        const next = updated[0]
        setActiveResult({
          id: next.id,
          field: next.field,
          profile: next.scores || [],
          ai: next.ai,
          created_at: next.created_at,
        })
      } else {
        setActiveResult(null)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete assessment.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Empty State: No results found
  if (!activeResult && !loading) {
    return (
      <PortalLayout
        title="Assessment Results"
        subtitle="AI-synthesized career pathways & psychometric breakdown"
      >
        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <div className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-3xl p-8 md:p-12 card-shadow space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#eaedff]/70 text-[#4f46e5] flex items-center justify-center mx-auto border border-[#c3c0ff]/60">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="text-2xl font-bold text-[#131b2e] tracking-tight">
              No Assessment Results Yet
            </h2>
            <p className="text-sm text-[#464555] max-w-md mx-auto leading-relaxed">
              You haven't completed a career assessment yet. Type your field or stream to generate your personalized 10-question quiz and receive tailored career advice!
            </p>
            <div className="pt-2">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-base">quiz</span>
                <span>Start Assessment</span>
              </Link>
            </div>
          </div>
        </div>
      </PortalLayout>
    )
  }

  const { id, field, profile = [], ai = {}, created_at } = activeResult || {}
  const topTraitCode = profile.length > 0 ? profile[0].trait : null
  const topTraitMeta = topTraitCode ? TRAIT_METADATA[topTraitCode] : null

  return (
    <PortalLayout
      title="Personalized Career Guidance"
      subtitle={`Comprehensive trajectory report for "${field || 'Your Field'}"`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ================= HEADER HERO CARD ================= */}
        <section className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-3xl p-6 sm:p-8 card-shadow relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#eaedff] text-[#3525cd] text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">school</span>
                  {field || 'Field Exploration'}
                </span>
                {topTraitMeta && (
                  <span className="px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] text-xs font-bold border border-[#a7f3d0]">
                    Primary Strength: {topTraitMeta.name} ({topTraitCode})
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                Career Guidance &amp; Pathway Analysis
              </h2>

              <p className="text-xs sm:text-sm text-[#464555] max-w-2xl leading-relaxed">
                {ai?.summary ||
                  `Based on your responses in ${field}, Raah evaluated your aptitudes across 6 core industry competencies to recommend realistic university and career trajectories.`}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/assessment')}
                className="px-4 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Test Another Field</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(id)}
                disabled={isDeleting}
                className="px-3 py-2.5 bg-white/50 hover:bg-[#fee2e2] text-[#dc2626] text-xs font-semibold rounded-xl border border-[#fecaca] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Delete this result"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Delete Result</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= 6-TRAIT STRENGTHS SPECTRUM ================= */}
        <section className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-3xl p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-[#c7c4d8]/40 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">
                Competency &amp; Trait Strengths Spectrum
              </h3>
              <p className="text-xs text-[#777587]">
                Percentage scores calculated from your 10 scenario choices (A, C, S, L, B, O)
              </p>
            </div>
            <span className="material-symbols-outlined text-[#4f46e5] text-2xl">bar_chart</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.map((p) => {
              const meta = TRAIT_METADATA[p.trait] || {
                name: p.trait,
                desc: 'Trait score',
                color: '#4f46e5',
                bgColor: '#eaedff',
                icon: 'star',
              }
              const scoreVal = Math.round(p.score)

              return (
                <div
                  key={p.trait}
                  className="p-4 rounded-2xl bg-white/50 border border-white/80 space-y-3 shadow-xs hover:bg-white/80 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-xs text-white"
                        style={{ backgroundColor: meta.color }}
                      >
                        {p.trait}
                      </span>
                      <span className="font-bold text-sm text-[#131b2e]">{meta.name}</span>
                    </div>
                    <span className="text-base font-extrabold" style={{ color: meta.color }}>
                      {scoreVal}%
                    </span>
                  </div>

                  <p className="text-[11px] text-[#555] line-clamp-2 leading-relaxed">
                    {meta.desc}
                  </p>

                  <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(6, scoreVal)}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================= 4 REALISTIC CAREER PATHWAYS ================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-[#131b2e] tracking-tight">
                Recommended Career Trajectories for {field}
              </h3>
              <p className="text-xs text-[#777587]">
                Targeted modern specializations, initial action steps, and higher-study/exam gateways
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold border border-[#cbd5e1] self-start">
              4 Realistic Pathways
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(ai?.careers || []).map((career, idx) => (
              <div
                key={idx}
                className="bg-white/30 backdrop-blur-[2px] border border-white/70 rounded-3xl p-6 card-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Role Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider">
                        Trajectory {idx + 1}
                      </span>
                      <h4 className="text-lg font-bold text-[#131b2e]">{career.title}</h4>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">explore</span>
                    </div>
                  </div>

                  {/* Why it fits */}
                  <p className="text-xs text-[#464555] leading-relaxed bg-white/40 p-3 rounded-xl border border-white/60">
                    <strong className="text-[#131b2e]">Why this fits: </strong>
                    {career.why}
                  </p>

                  {/* Immediate Next Steps */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#10b981]">
                        task_alt
                      </span>
                      First Steps to Take Right Now:
                    </span>
                    <ul className="space-y-1.5">
                      {(career.first_steps || []).map((step, sIdx) => (
                        <li key={sIdx} className="text-xs text-[#464555] flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#eaedff] text-[#3525cd] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Higher Study / Exam Pathways */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#f59e0b]">
                        menu_book
                      </span>
                      Key Exams &amp; Higher Study Routes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(career.exams_or_courses || []).map((exam, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-2.5 py-1 rounded-lg bg-white/70 text-[#131b2e] text-[11px] font-semibold border border-[#c7c4d8]/60 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs text-[#4f46e5]">
                            school
                          </span>
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= REALISTIC ADVISORY & WATCH-OUT ================= */}
        {ai?.watch_out && (
          <section className="bg-[#fffbeb]/60 border border-[#fef3c7] rounded-3xl p-6 sm:p-7 space-y-2">
            <div className="flex items-center gap-2 text-[#92400e]">
              <span className="material-symbols-outlined text-xl">info</span>
              <h4 className="text-sm font-bold">Important Industry Realities to Keep in Mind</h4>
            </div>
            <p className="text-xs text-[#78350f] leading-relaxed pl-7">
              {ai.watch_out}
            </p>
          </section>
        )}
      </div>
    </PortalLayout>
  )
}
