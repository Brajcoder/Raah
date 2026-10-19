import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PortalLayout } from '../components/PortalLayout'
import { CAREERS_DATA, getSavedCareerIds, toggleSaveCareerId } from '../data/careersData'
import toast from 'react-hot-toast'

export const SavedCareers = () => {
  const [savedIds, setSavedIds] = useState(() => getSavedCareerIds())
  const [selectedForCompare, setSelectedForCompare] = useState(() => {
    const ids = getSavedCareerIds()
    return ids.slice(0, 2)
  })
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('match')
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem('raah_career_notes')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [tempNoteText, setTempNoteText] = useState('')
  const [showAdvisorModal, setShowAdvisorModal] = useState(false)
  const [milestones, setMilestones] = useState(() => {
    try {
      const raw = localStorage.getItem('raah_student_milestones')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [customGoalInput, setCustomGoalInput] = useState('')
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Handle removing career from saved
  const handleRemove = (id, title) => {
    const updated = toggleSaveCareerId(id)
    setSavedIds(updated)
    setSelectedForCompare((prev) => prev.filter((item) => item !== id))
    toast.success(`Removed "${title}" from saved pathways`)
  }

  // Toggle selection for comparison
  const handleToggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      if (selectedForCompare.length <= 1) {
        toast.error('Keep at least 1 career selected to compare')
        return
      }
      setSelectedForCompare((prev) => prev.filter((item) => item !== id))
    } else {
      if (selectedForCompare.length >= 3) {
        toast.error('You can compare up to 3 careers side-by-side')
        return
      }
      setSelectedForCompare((prev) => [...prev, id])
    }
  }

  // Handle note saving
  const handleStartEditNote = (career) => {
    setEditingNoteId(career.id)
    setTempNoteText(notes[career.id] ?? career.studentNote ?? '')
  }

  const handleSaveNote = (id) => {
    setNotes((prev) => {
      const updated = { ...prev, [id]: tempNoteText }
      try {
        localStorage.setItem('raah_career_notes', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
    setEditingNoteId(null)
    toast.success('Your personalized note has been saved')
  }

  // Toggle milestone completion
  const handleToggleMilestone = (id) => {
    setMilestones((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
      try {
        localStorage.setItem('raah_student_milestones', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  // Add custom milestone goal
  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!customGoalInput.trim()) return
    const newGoal = {
      id: Date.now(),
      text: customGoalInput.trim(),
      tag: 'Added by you',
      done: false,
    }
    setMilestones((prev) => {
      const updated = [...prev, newGoal]
      try {
        localStorage.setItem('raah_student_milestones', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
    setCustomGoalInput('')
    setShowAddGoal(false)
    toast.success('Added new custom goal!')
  }

  // Export report
  const handleExport = () => {
    toast.success('Career comparison summary exported to PDF report.')
  }

  // Saved careers data
  const savedCareersList = useMemo(() => {
    return CAREERS_DATA.filter((c) => savedIds.includes(c.id))
      .filter((c) => {
        if (activeTab === 'High Priority') return c.matchScore >= 90
        if (activeTab === 'Internships') return c.status.toLowerCase().includes('internship') || c.status.toLowerCase().includes('course')
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore
        if (sortBy === 'salary') return b.maxSalary - a.maxSalary
        return 0
      })
  }, [savedIds, activeTab, sortBy])

  // Compared careers objects
  const comparedCareers = useMemo(() => {
    return CAREERS_DATA.filter((c) => selectedForCompare.includes(c.id))
  }, [selectedForCompare])

  const completedMilestones = milestones.filter((m) => m.done).length
  const milestoneProgress = Math.round((completedMilestones / (milestones.length || 1)) * 100)

  return (
    <PortalLayout title="Saved Careers & Pathways" subtitle="Compare your shortlisted careers and track prerequisites">
      <div className="max-w-[1360px] mx-auto flex flex-col gap-6">
        {/* ================= 1. PAGE HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#c7c4d8]/70">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                Saved Careers &amp; Pathways
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eaedff] text-[#4f46e5]">
                {savedCareersList.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              Compare your shortlisted careers, track prerequisites, and organize your career discovery journey.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/60 bg-white/40 hover:bg-white/60 text-[#131b2e] text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#4f46e5]">
                ios_share
              </span>
              <span>Export Report</span>
            </button>
            <a
              href="#compare-section"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              <span>Compare Selected ({comparedCareers.length})</span>
            </a>
          </div>
        </div>

        {/* ================= 2. QUICK COMPARISON BANNER ================= */}
        {comparedCareers.length > 0 && (
          <section
            id="compare-section"
            className="bg-gradient-to-br from-white via-[#f2f3ff] to-[#eaedff]/30 rounded-2xl border border-[#c7c4d8]/80 p-5 shadow-xs relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-lg">insights</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#4f46e5] tracking-wider">
                      Side-by-Side Snapshot
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6ffbbe]/40 text-[#005338]">
                      {comparedCareers.length} Selected
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                    Career Comparison Matrix
                  </h2>
                </div>
              </div>
              <p className="text-xs text-[#777587]">
                Check or uncheck boxes below to change the compared roles
              </p>
            </div>

            {/* Comparison Grid */}
            <div
              className={`grid grid-cols-1 ${
                comparedCareers.length === 1
                  ? 'md:grid-cols-1'
                  : comparedCareers.length === 2
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-3'
              } gap-4`}
            >
              {comparedCareers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl p-4 border border-[#c7c4d8]/80 hover:border-[#4f46e5]/40 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="material-symbols-outlined text-xs text-emerald-600">
                            auto_awesome
                          </span>
                          {c.matchScore}% Match
                        </span>
                        <span className="text-[11px] font-medium text-[#777587]">
                          {c.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#131b2e] mt-1">{c.title}</h3>
                    </div>
                    <span className="material-symbols-outlined text-[#4f46e5] text-xl">
                      check_circle
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#c7c4d8]/40 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#777587] block">
                        Median Salary
                      </span>
                      <span className="font-bold text-[#131b2e]">{c.salaryRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#777587] block">
                        Work Environment
                      </span>
                      <span className="font-medium text-[#131b2e]">{c.workMode}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-[#777587] block">
                        Typical Degree
                      </span>
                      <span className="font-medium text-[#131b2e] text-[11px] line-clamp-1">
                        {c.recommendedDegree}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-[#777587] block">
                        Top Skills
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#131b2e] text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= 3. FILTER TABS & SORT ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#c7c4d8]/70 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {['All', 'High Priority', 'Internships'].map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4f46e5] text-white shadow-xs'
                      : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff]'
                  }`}
                >
                  {tab === 'All' && `All Saved (${savedIds.length})`}
                  {tab === 'High Priority' && 'High Match (90%+)'}
                  {tab === 'Internships' && 'Internships & Pathways'}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-[#777587]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/40 border border-white/60 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#131b2e] outline-none focus:border-[#4f46e5] cursor-pointer"
            >
              <option value="match">Match Score (High to Low)</option>
              <option value="salary">Salary (High to Low)</option>
            </select>
          </div>
        </div>

        {/* ================= 4. MAIN TWO-COLUMN CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Saved Careers List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {savedCareersList.length === 0 ? (
              <div className="bg-white/20 backdrop-blur-[2px] rounded-2xl border border-white/60 p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#eaedff]/60 text-[#777587] flex items-center justify-center mx-auto mb-3 border border-[#c3c0ff]/40">
                  <span className="material-symbols-outlined text-2xl">bookmark_border</span>
                </div>
                <h3 className="text-base font-bold text-[#131b2e]">No careers saved in this view</h3>
                <p className="text-xs text-[#777587] mt-1 max-w-sm mx-auto">
                  Browse our catalog of verified modern career trajectories and shortlist roles that excite you.
                </p>
                <Link
                  to="/explore"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#3525cd] transition-colors"
                >
                  <span>Explore Careers Catalog</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ) : (
              savedCareersList.map((career) => {
                const isCompared = selectedForCompare.includes(career.id)
                const currentNote = notes[career.id] ?? career.studentNote

                return (
                  <article
                    key={career.id}
                    className="bg-white rounded-2xl border border-[#c7c4d8]/70 p-5 hover:border-[#c3c0ff] hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => handleToggleCompare(career.id)}
                          title="Select to compare side-by-side"
                          className="mt-1 w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/30 border-[#777587] cursor-pointer"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="material-symbols-outlined text-xs text-emerald-600">
                                auto_awesome
                              </span>
                              {career.matchScore}% Match
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaedff] text-[#464555]">
                              {career.category}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${career.statusColor}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {career.status}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-[#131b2e] mt-1.5">
                            {career.title}
                          </h3>
                          <p className="text-[11px] text-[#777587]">
                            Holland Archetype: {career.code} • {career.archetype}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-[#777587] block">
                          Median Salary
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#131b2e]">
                          {career.salaryRange}
                        </span>
                        <span className="text-[11px] text-emerald-700 block font-medium">
                          {career.growth}
                        </span>
                      </div>
                    </div>

                    {/* Prerequisite degree & certs */}
                    <div className="mt-3.5 pt-3 border-t border-[#c7c4d8]/40 flex flex-wrap gap-y-2 gap-x-6 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#777587] block">
                          Recommended Degree
                        </span>
                        <span className="font-medium text-[#131b2e]">
                          {career.recommendedDegree}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#777587] block">
                          Target Certifications
                        </span>
                        <span className="font-medium text-[#131b2e]">
                          {career.certifications}
                        </span>
                      </div>
                    </div>

                    {/* Student Personalized Note */}
                    <div className="mt-3 p-3 bg-[#f2f3ff] rounded-xl border border-[#c7c4d8]/60 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#4f46e5] text-base mt-0.5">
                        edit_note
                      </span>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-[#131b2e] block">
                          Your Study Note:
                        </span>
                        {editingNoteId === career.id ? (
                          <div className="mt-1 space-y-2">
                            <textarea
                              rows={2}
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-white border border-[#4f46e5] outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveNote(career.id)}
                                className="px-3 py-1 bg-[#4f46e5] text-white text-[11px] font-bold rounded-md hover:bg-[#3525cd] transition-colors cursor-pointer"
                              >
                                Save Note
                              </button>
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-3 py-1 bg-white text-[#777587] text-[11px] font-semibold rounded-md border border-[#c7c4d8] hover:bg-[#f2f3ff] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#464555] italic leading-relaxed">
                            "{currentNote || 'No notes added yet. Click edit to add your course or internship goal.'}"
                          </p>
                        )}
                      </div>
                      {editingNoteId !== career.id && (
                        <button
                          onClick={() => handleStartEditNote(career)}
                          className="text-[11px] text-[#4f46e5] hover:underline font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="mt-4 pt-3 border-t border-[#c7c4d8]/40 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditNote(career)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c7c4d8]/70 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Note</span>
                        </button>
                        <button
                          onClick={() => setShowAdvisorModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c7c4d8]/70 hover:bg-[#f2f3ff] text-[#131b2e] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          <span>Advisor</span>
                        </button>
                        <button
                          onClick={() => handleRemove(career.id, career.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>Remove</span>
                        </button>
                      </div>

                      <Link
                        to="/explore"
                        className="inline-flex items-center gap-1 text-[#4f46e5] hover:underline text-xs font-bold"
                      >
                        <span>View Pathway in Catalog</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {/* Right Column (4 cols): Milestones & Advisor */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Widget 1: Next Milestones */}
            <div className="bg-white/20 backdrop-blur-[2px] rounded-2xl border border-white/60 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">checklist</span>
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#131b2e]">
                    Next Milestones
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eaedff]/70 text-[#4f46e5] border border-[#c3c0ff]/50">
                  {completedMilestones} / {milestones.length} Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/40 rounded-full h-2 mb-4 overflow-hidden border border-white/40">
                <div
                  className="bg-[#4f46e5] h-full rounded-full transition-all duration-300"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="flex flex-col gap-2.5">
                {milestones.length === 0 ? (
                  <p className="text-xs text-[#777587] py-3 text-center bg-white/30 rounded-xl border border-dashed border-[#c7c4d8]/60">
                    No milestones added yet. Click &quot;Add Custom Goal&quot; below to define your targets.
                  </p>
                ) : (
                  milestones.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      m.done
                        ? 'bg-white/20 border-transparent text-[#777587]'
                        : 'bg-white/40 border-white/60 hover:bg-white/60 text-[#131b2e]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={() => handleToggleMilestone(m.id)}
                      className="mt-0.5 w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/20 border-[#777587] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs block ${
                          m.done ? 'line-through text-[#777587]' : 'font-semibold text-[#131b2e]'
                        }`}
                      >
                        {m.text}
                      </span>
                      <span className="text-[10px] text-[#005338] font-semibold flex items-center gap-1 mt-0.5">
                        {m.done && (
                          <span className="material-symbols-outlined text-xs">done</span>
                        )}
                        {m.tag}
                      </span>
                    </div>
                  </label>
                )))}
              </div>

              {/* Add Custom Goal Input */}
              {showAddGoal ? (
                <form onSubmit={handleAddGoal} className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    placeholder="Enter milestone (e.g. Finish portfolio site)..."
                    className="w-full text-xs p-2 bg-white/60 border border-[#4f46e5] rounded-xl outline-none text-[#131b2e]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:bg-[#3525cd] cursor-pointer"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGoal(false)}
                      className="px-3 py-1.5 bg-white/60 text-[#777587] text-xs font-semibold rounded-lg border border-white/60 hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-3 w-full py-2 border border-dashed border-[#c7c4d8]/60 hover:border-[#4f46e5] bg-white/20 hover:bg-white/40 rounded-xl text-[#4f46e5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Add Custom Goal</span>
                </button>
              )}
            </div>

            {/* Widget 2: Advisor Support Card */}
            <div className="bg-white/20 backdrop-blur-[2px] rounded-2xl border border-white/60 p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#131b2e]">
                    Advisor Support
                  </h4>
                  <p className="text-[11px] text-[#777587]">Assigned Academic &amp; Career Coach</p>
                </div>
              </div>

              <div className="bg-white/35 backdrop-blur-xs rounded-xl p-3 border border-white/50 flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#eaedff] flex items-center justify-center text-[#4f46e5] font-bold text-xs">
                  CA
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#131b2e] block truncate">
                    Academic Pathway Coach
                  </span>
                  <span className="text-[10px] text-[#777587] block truncate">
                    STEM &amp; Student Career Services
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Available this week" />
              </div>

              <p className="text-xs text-[#464555] mb-4 leading-relaxed">
                Connect with an academic counselor for a 25-minute transcript &amp; career trajectory alignment session.
              </p>

              <button
                onClick={() => setShowAdvisorModal(true)}
                className="w-full py-2.5 px-4 bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">event_available</span>
                <span>Book Guidance Slot</span>
              </button>
              <p className="text-center text-[10px] text-[#777587] mt-2 font-medium">
                Next opening: Tomorrow at 2:30 PM
              </p>
            </div>

            {/* Widget 3: Discovery Tip Card */}
            <div className="bg-white/20 backdrop-blur-[2px] rounded-2xl border border-white/60 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-[#4f46e5] font-bold text-xs mb-2">
                <span className="material-symbols-outlined text-base">lightbulb</span>
                <span>Discovery Tip</span>
              </div>
              <p className="text-xs text-[#464555] leading-relaxed">
                Students who compare at least 3 career paths before course registration report 40% higher major satisfaction in their junior year.
              </p>
            </div>
          </div>
        </div>

        {/* ================= Advisor Booking Modal ================= */}
        {showAdvisorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#c7c4d8] shadow-2xl relative">
              <button
                onClick={() => setShowAdvisorModal(false)}
                className="absolute top-4 right-4 text-[#777587] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">event_available</span>
              </div>
              <h3 className="text-lg font-bold text-[#131b2e]">Book with Career Coach</h3>
              <p className="text-xs text-[#777587] mt-1">
                Select an open advising appointment to review your career pathways and course load.
              </p>

              <div className="mt-4 space-y-2">
                {[
                  { day: 'Tomorrow', time: '2:30 PM - 3:00 PM', type: 'Virtual Zoom' },
                  { day: 'Thursday', time: '10:00 AM - 10:30 AM', type: 'Advising Office 204' },
                  { day: 'Friday', time: '1:15 PM - 1:45 PM', type: 'Virtual Zoom' },
                ].map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      toast.success(`Reserved advising slot for ${slot.day} at ${slot.time}`)
                      setShowAdvisorModal(false)
                    }}
                    className="w-full p-3 rounded-xl border border-[#c7c4d8]/70 hover:border-[#4f46e5] hover:bg-[#eaedff]/30 text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#131b2e]">{slot.day} • {slot.time}</div>
                      <div className="text-[11px] text-[#777587]">{slot.type}</div>
                    </div>
                    <span className="material-symbols-outlined text-base text-[#4f46e5]">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
