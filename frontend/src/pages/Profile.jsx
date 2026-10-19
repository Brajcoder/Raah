import React, { useState } from 'react'
import { PortalLayout } from '../components/PortalLayout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AVATAR_PRESETS = [
  { id: 'indigo', label: 'Indigo Tech', bg: 'bg-[#4f46e5]', text: 'text-white' },
  { id: 'violet', label: 'Violet Creative', bg: 'bg-[#7c3aed]', text: 'text-white' },
  { id: 'emerald', label: 'Emerald Health', bg: 'bg-[#059669]', text: 'text-white' },
  { id: 'amber', label: 'Amber Leadership', bg: 'bg-[#fea619]', text: 'text-[#684000]' },
  { id: 'rose', label: 'Rose Dynamic', bg: 'bg-[#e11d48]', text: 'text-white' },
  { id: 'slate', label: 'Minimal Slate', bg: 'bg-[#334155]', text: 'text-white' },
]

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Raah Indigo', hex: '#4f46e5' },
  { id: 'violet', label: 'Royal Violet', hex: '#7c3aed' },
  { id: 'emerald', label: 'Nordic Emerald', hex: '#059669' },
  { id: 'amber', label: 'Golden Amber', hex: '#fea619' },
]

export const Profile = () => {
  const { user, profile, updateProfile, updatePassword } = useAuth()

  const [activeTab, setActiveTab] = useState('academic')
  const [saving, setSaving] = useState(false)

  // Form State
  // Form State initialized from authenticated profile
  const [fullName, setFullName] = useState(
    () =>
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      (user?.email ? user.email.split('@')[0] : 'Student Explorer')
  )
  const [tagline, setTagline] = useState(() => profile?.tagline || '')
  const [academicStage, setAcademicStage] = useState(
    () => profile?.academic_stage || 'Undergraduate'
  )
  const [institution, setInstitution] = useState(
    () => profile?.institution || ''
  )
  const [major, setMajor] = useState(() => profile?.major || '')
  const [graduationYear, setGraduationYear] = useState(
    () => profile?.graduation_year || ''
  )
  const [bio, setBio] = useState(() => profile?.bio || '')
  const [hollandArchetype, setHollandArchetype] = useState(
    () => profile?.holland_archetype || ''
  )

  // Avatar customization
  const [avatarPreset, setAvatarPreset] = useState(
    () => profile?.avatar_preset || 'indigo'
  )
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
    () => profile?.avatar_url || ''
  )
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Preferences & Customization
  const [accentColor, setAccentColor] = useState(
    () => profile?.accent_color || 'indigo'
  )
  const [notifyDigest, setNotifyDigest] = useState(true)
  const [notifyAlerts, setNotifyAlerts] = useState(true)
  const [notifyAdvisor, setNotifyAdvisor] = useState(true)
  const [shareWithAdvisor, setShareWithAdvisor] = useState(true)

  // Skills Editor
  const [skills, setSkills] = useState(
    () =>
      profile?.skills && Array.isArray(profile.skills)
        ? profile.skills
        : []
  )
  const [newSkillInput, setNewSkillInput] = useState('')

  // Password Security Form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const displayName = fullName || 'Student Explorer'
  const displayEmail = profile?.email || user?.email || 'student@raah.edu'
  const userInitial = (displayName || 'U')[0].toUpperCase()

  const currentPresetObj = AVATAR_PRESETS.find((p) => p.id === avatarPreset) || AVATAR_PRESETS[0]

  // Add skill tag
  const handleAddSkill = (e) => {
    e.preventDefault()
    const clean = newSkillInput.trim()
    if (!clean) return
    if (skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      toast.error('Skill is already listed')
      return
    }
    setSkills([...skills, clean])
    setNewSkillInput('')
  }

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // Handle Save All Profile Settings
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty')
      return
    }

    setSaving(true)
    try {
      const updates = {
        full_name: fullName.trim(),
        tagline: tagline.trim(),
        academic_stage: academicStage,
        institution: institution.trim(),
        major: major.trim(),
        graduation_year: graduationYear,
        bio: bio.trim(),
        holland_archetype: hollandArchetype,
        avatar_url: customAvatarUrl.trim() || null,
        avatar_preset: avatarPreset,
        accent_color: accentColor,
        skills,
        notifications: {
          weekly_digest: notifyDigest,
          market_alerts: notifyAlerts,
          advisor_reminders: notifyAdvisor,
        },
        share_with_advisor: shareWithAdvisor,
      }

      const { error } = await updateProfile(updates)
      if (error) {
        toast.error(`Error saving profile: ${error.message}`)
      } else {
        toast.success('Profile and preferences updated successfully!')
        setShowAvatarPicker(false)
      }
    } catch {
      toast.error('An unexpected error occurred while saving profile.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Your password has been changed securely.')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      toast.error('Failed to change password. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <PortalLayout
      title="Profile Dashboard & Settings"
      subtitle="Customize your academic identity, Holland RIASEC interests, and portal preferences"
    >
      <div className="max-w-[1240px] mx-auto space-y-6">
        {/* ================= HERO PROFILE BANNER ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-[2px] text-[#131b2e] p-6 sm:p-8 shadow-xs border border-white/60">
          {/* Ambient Lighting & Pattern */}
          <div className="absolute inset-0 hero-grid-pattern opacity-30 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#fea619]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#c3c0ff]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar with Customizer Button */}
              <div className="relative group">
                {customAvatarUrl ? (
                  <img
                    alt={displayName}
                    src={customAvatarUrl}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/50 shadow-md"
                  />
                ) : (
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${currentPresetObj.bg} ${currentPresetObj.text} flex items-center justify-center font-extrabold text-2xl sm:text-3xl ring-4 ring-white/50 shadow-md`}
                  >
                    {userInitial}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-[#4f46e5] flex items-center justify-center shadow-md hover:bg-[#f2f3ff] transition-transform active:scale-95 cursor-pointer border border-[#c7c4d8]/60"
                  title="Customize Avatar Style"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>

              {/* Title & Tags */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4f46e5]/10 text-[#4f46e5] border border-[#4f46e5]/20 backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006e4b] animate-pulse" />
                    Verified Student
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffddb8]/60 text-[#855300] border border-[#ffddb8]">
                    {academicStage}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/40 text-[#4f46e5] border border-white/60">
                    Code: {hollandArchetype}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131b2e]">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-[#464555] max-w-xl font-medium">
                  {tagline}
                </p>
                <div className="text-xs text-[#777587] flex items-center gap-2 pt-0.5">
                  <span className="material-symbols-outlined text-[15px]">school</span>
                  <span>{institution}</span>
                </div>
              </div>
            </div>

            {/* Quick Action in Banner */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">
                  {saving ? 'sync' : 'save'}
                </span>
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
              <span className="text-[11px] text-[#777587] text-center md:text-right font-medium">
                All changes automatically synchronize
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#c7c4d8]/40 text-center">
            <div className="bg-white/35 rounded-xl p-2.5 backdrop-blur-xs border border-white/50">
              <span className="text-[10px] uppercase font-bold text-[#777587] block">
                RIASEC Assessment
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#131b2e]">
                Completed (IAS)
              </span>
            </div>
            <div className="bg-white/35 rounded-xl p-2.5 backdrop-blur-xs border border-white/50">
              <span className="text-[10px] uppercase font-bold text-[#777587] block">
                Target Graduation
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#131b2e]">
                Class of {graduationYear}
              </span>
            </div>
            <div className="bg-white/35 rounded-xl p-2.5 backdrop-blur-xs border border-white/50">
              <span className="text-[10px] uppercase font-bold text-[#777587] block">
                Active Skills
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#131b2e]">
                {skills.length} Endorsed
              </span>
            </div>
            <div className="bg-white/35 rounded-xl p-2.5 backdrop-blur-xs border border-white/50">
              <span className="text-[10px] uppercase font-bold text-[#777587] block">
                Advisor Access
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#006e4b]">
                {shareWithAdvisor ? 'Enabled' : 'Private'}
              </span>
            </div>
          </div>
        </section>

        {/* ================= AVATAR PRESET PICKER MODAL / ACCORDION ================= */}
        {showAvatarPicker && (
          <div className="bg-white border border-[#c7c4d8]/70 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#131b2e]">Avatar Customization</h3>
                <p className="text-xs text-[#777587]">
                  Choose a signature color badge preset or enter your custom photo URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="p-1 rounded-lg text-[#777587] hover:bg-[#f2f3ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = avatarPreset === preset.id && !customAvatarUrl
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarPreset(preset.id)
                      setCustomAvatarUrl('')
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4f46e5] bg-[#eaedff] ring-2 ring-[#4f46e5]/20'
                        : 'border-[#c7c4d8]/70 bg-white hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${preset.bg} ${preset.text} flex items-center justify-center font-bold text-xs flex-shrink-0`}
                    >
                      {userInitial}
                    </div>
                    <span className="text-xs font-semibold text-[#131b2e] truncate">
                      {preset.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Custom URL Input */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                placeholder="Or paste external photo URL (e.g. https://...)"
                className="w-full text-xs p-2.5 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  toast.success('Custom avatar URL set!')
                  setShowAvatarPicker(false)
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#3525cd] transition-colors cursor-pointer whitespace-nowrap"
              >
                Apply Image
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB NAVIGATION STRIP ================= */}
        <div className="flex items-center gap-2 border-b border-[#c7c4d8]/70 pb-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'academic', label: 'Academic & Personal Details', icon: 'school' },
            { id: 'holland', label: 'RIASEC & Career Focus', icon: 'psychology' },
            { id: 'preferences', label: 'Preferences & Notifications', icon: 'tune' },
            { id: 'security', label: 'Security & Access', icon: 'lock' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4f46e5] text-white shadow-xs'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ================= TAB 1: ACADEMIC & PERSONAL DETAILS ================= */}
        {activeTab === 'academic' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white/20 backdrop-blur-[2px] rounded-3xl border border-white/60 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#c7c4d8]/60 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                  Academic Profile & Student Identity
                </h2>
                <p className="text-xs text-[#777587]">
                  These details customize your career discovery recommendations and university roadmaps.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Maya Lin"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
                  />
                </div>

                {/* Tagline / Pronouns */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Headline / Career Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Aspiring UX Designer & HCI Enthusiast"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
                  />
                </div>

                {/* Email Address (Read-only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] flex items-center justify-between uppercase tracking-wider">
                    <span>Registered Email</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#faf8ff] border border-[#c7c4d8]/40 text-[#777587] cursor-not-allowed"
                  />
                </div>

                {/* Academic Stage Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Current Academic Stage
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['High School', 'Undergraduate', 'Graduate', 'Professional'].map((stage) => {
                      const isSelected = academicStage === stage
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setAcademicStage(stage)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs'
                              : 'bg-[#f2f3ff] text-[#464555] border-[#c7c4d8]/70 hover:bg-[#eaedff]'
                          }`}
                        >
                          {stage}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Institution / University */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    University or Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
                  />
                </div>

                {/* Major / Field of Study */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Major / Intended Field
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. B.S. Human-Computer Interaction"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
                  />
                </div>

                {/* Expected Graduation Year */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Expected Graduation Year
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['2025', '2026', '2027', '2028', '2029+'].map((yr) => {
                      const isSelected = graduationYear === yr
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setGraduationYear(yr)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs'
                              : 'bg-[#f2f3ff] text-[#464555] border-[#c7c4d8]/70 hover:bg-[#eaedff]'
                          }`}
                        >
                          Class of {yr}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bio / Aspirations */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Bio &amp; Career Aspirations
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your academic advisor and peers about your key career interests, project ambitions, or favorite subjects..."
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Submit Footer */}
              <div className="pt-4 border-t border-[#c7c4d8]/60 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Academic Details'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= TAB 2: RIASEC & CAREER FOCUS ================= */}
        {activeTab === 'holland' && (
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-[2px] rounded-3xl border border-white/60 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#c7c4d8]/60 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                  Holland Occupational RIASEC Archetype
                </h2>
                <p className="text-xs text-[#777587]">
                  Your Holland RIASEC code guides our AI matching algorithm to recommend high-compatibility career pathways.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    code: 'IAS',
                    title: 'Investigative + Artistic (IAS)',
                    desc: 'Analytical inquiry mixed with creative visual and empathy-driven software systems.',
                    badge: 'Recommended for you',
                  },
                  {
                    code: 'EAI',
                    title: 'Enterprising + Artistic (EAI)',
                    desc: 'Product strategy, entrepreneurial initiatives, agile management, and design direction.',
                    badge: 'Alternative',
                  },
                  {
                    code: 'RIC',
                    title: 'Realistic + Investigative (RIC)',
                    desc: 'Hardware prototyping, sensor robotics, scientific laboratory and technical precision.',
                    badge: 'Technical',
                  },
                ].map((item) => {
                  const isSelected = hollandArchetype === item.code
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setHollandArchetype(item.code)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4f46e5] bg-[#eaedff] ring-2 ring-[#4f46e5]/20 shadow-xs'
                          : 'border-[#c7c4d8]/70 bg-white hover:bg-[#f2f3ff]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#4f46e5] border border-[#c7c4d8]">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-[#777587] font-semibold">{item.badge}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#131b2e]">{item.title}</h4>
                      <p className="text-xs text-[#464555] mt-1.5 leading-relaxed">{item.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Skills Tag Management */}
              <div className="space-y-3 pt-4 border-t border-[#c7c4d8]/60">
                <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  Target Skills &amp; Proficiencies
                </h3>
                <p className="text-xs text-[#777587]">
                  Add technical and soft skills to prioritize in course recommendations and internship roadmaps.
                </p>

                {/* Current Skills List */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eaedff] text-[#4f46e5] text-xs font-semibold border border-[#c3c0ff]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-4 h-4 rounded-full hover:bg-white flex items-center justify-center cursor-pointer text-[#4f46e5]"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Skill Input */}
                <form onSubmit={handleAddSkill} className="flex items-center gap-3 pt-2 max-w-md">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add a new skill (e.g. React, SQL, Wireframing)..."
                    className="flex-1 text-xs p-2.5 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 focus:outline-none focus:border-[#4f46e5] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#3525cd] transition-colors cursor-pointer"
                  >
                    Add Skill
                  </button>
                </form>
              </div>

              <div className="pt-4 border-t border-[#c7c4d8]/60 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Career Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PREFERENCES & CUSTOMIZATION ================= */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-[2px] rounded-3xl border border-white/60 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#c7c4d8]/60 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                  Portal Preferences &amp; Theme Customization
                </h2>
                <p className="text-xs text-[#777587]">
                  Personalize the styling and notification digest frequency for your student portal.
                </p>
              </div>

              {/* Accent Color Theme */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  Accent Color Palette
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ACCENT_COLORS.map((c) => {
                    const isSelected = accentColor === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAccentColor(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#4f46e5] bg-[#eaedff] ring-2 ring-[#4f46e5]/20 shadow-xs'
                            : 'border-[#c7c4d8]/70 bg-white hover:bg-[#f2f3ff]'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-xs flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-bold text-[#131b2e]">{c.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3 pt-4 border-t border-[#c7c4d8]/60">
                <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  Email &amp; Alert Notifications
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#c7c4d8]/70 hover:bg-[#faf8ff] transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#131b2e] block">
                        Weekly Career Trajectory Digest
                      </span>
                      <span className="text-[11px] text-[#777587]">
                        Receive an email summary of newly indexed careers and emerging job roles.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDigest}
                      onChange={(e) => setNotifyDigest(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/20 border-[#777587]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#c7c4d8]/70 hover:bg-[#faf8ff] transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#131b2e] block">
                        Labor Statistics &amp; Compensation Alerts
                      </span>
                      <span className="text-[11px] text-[#777587]">
                        Get notified when salary ranges change for your saved careers.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyAlerts}
                      onChange={(e) => setNotifyAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/20 border-[#777587]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#c7c4d8]/70 hover:bg-[#faf8ff] transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#131b2e] block">
                        Academic Advisor Appointment Reminders
                      </span>
                      <span className="text-[11px] text-[#777587]">
                        24-hour reminder before scheduled counseling or transcript review sessions.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyAdvisor}
                      onChange={(e) => setNotifyAdvisor(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/20 border-[#777587]"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="space-y-3 pt-4 border-t border-[#c7c4d8]/60">
                <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  Advisor Privacy &amp; Data Sharing
                </h3>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#c7c4d8]/70 hover:bg-[#faf8ff] transition-colors cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#131b2e] block">
                      Share RIASEC Results with Campus Advisors
                    </span>
                    <span className="text-[11px] text-[#777587]">
                      Allows verified academic advisors and career coaches to view your assessment scores.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareWithAdvisor}
                    onChange={(e) => setShareWithAdvisor(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4f46e5] focus:ring-[#4f46e5]/20 border-[#777587]"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-[#c7c4d8]/60 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Portal Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY & ACCESS ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-[2px] rounded-3xl border border-white/60 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#c7c4d8]/60 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
                  Account Security &amp; Credentials
                </h2>
                <p className="text-xs text-[#777587]">
                  Manage your password and review your active session authentication status.
                </p>
              </div>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/70 text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#4f46e5] text-white hover:bg-[#3525cd] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>

              {/* Session status banner */}
              <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#c7c4d8]/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#006e4b]">
                    verified_user
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#131b2e] block">
                      Protected Session &amp; TLS Encryption
                    </span>
                    <span className="text-[11px] text-[#777587]">
                      Your profile and assessments are stored with enterprise-grade AES-256 encryption.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
