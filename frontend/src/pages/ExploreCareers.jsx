import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PortalLayout } from '../components/PortalLayout'
import { CAREERS_DATA, getSavedCareerIds, toggleSaveCareerId } from '../data/careersData'
import toast from 'react-hot-toast'

export const ExploreCareers = () => {
  const [savedIds, setSavedIds] = useState(() => getSavedCareerIds())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [salaryFilter, setSalaryFilter] = useState('All')
  const [educationFilter, setEducationFilter] = useState('All')
  const [workEnvFilter, setWorkEnvFilter] = useState('All')
  const [growthFilter, setGrowthFilter] = useState('All')
  const [sortBy, setSortBy] = useState('match')
  const [selectedCareerModal, setSelectedCareerModal] = useState(null)

  const handleToggleSave = (id, title) => {
    const updated = toggleSaveCareerId(id)
    setSavedIds(updated)
    const isNowSaved = updated.includes(id)
    if (isNowSaved) {
      toast.success(`Saved "${title}" to your shortlist`)
    } else {
      toast.success(`Removed "${title}" from shortlist`)
    }
  }

  if (CAREERS_DATA.length === 0) {
    return (
      <PortalLayout title="Explore Careers" subtitle="Career Pathways & Trajectories">
        <div className="max-w-xl mx-auto py-16 text-center">
          <div className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-2xl p-8 md:p-12 card-shadow shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#eaedff]/60 text-[#4f46e5] flex items-center justify-center mx-auto mb-4 border border-[#c3c0ff]/40">
              <span className="material-symbols-outlined text-3xl">work_off</span>
            </div>
            <h2 className="text-xl font-bold text-[#131b2e] tracking-tight">
              Careers Catalog Cleared
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#777587] max-w-sm mx-auto leading-relaxed">
              All career data and exploratory pathways have been cleared from the catalog.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:bg-[#3525cd] transition-all shadow-sm cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </PortalLayout>
    )
  }

  // Filtered and Sorted careers list
  const filteredCareers = useMemo(() => {
    return CAREERS_DATA.filter((item) => {
      // Category Filter
      if (selectedCategory === 'High Match (85%+)') {
        if (item.matchScore < 85) return false
      } else if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesSkills = item.skills.some((s) => s.toLowerCase().includes(q))
        const matchesArchetype = item.archetype.toLowerCase().includes(q)
        const matchesReason = item.matchReason.toLowerCase().includes(q)
        if (!matchesTitle && !matchesSkills && !matchesArchetype && !matchesReason) {
          return false
        }
      }

      // Salary Filter
      if (salaryFilter === 'over-100k' && item.maxSalary < 100000) return false
      if (salaryFilter === 'over-130k' && item.maxSalary < 130000) return false

      // Education Filter
      if (educationFilter !== 'All' && !item.education.toLowerCase().includes(educationFilter.toLowerCase())) {
        return false
      }

      // Work Environment Filter
      if (workEnvFilter !== 'All' && !item.workMode.toLowerCase().includes(workEnvFilter.toLowerCase())) {
        return false
      }

      // Growth Filter
      if (growthFilter === 'surge' && item.growthRate < 20) return false
      if (growthFilter === 'high' && item.growthRate < 15) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore
      if (sortBy === 'salary') return b.maxSalary - a.maxSalary
      if (sortBy === 'growth') return b.growthRate - a.growthRate
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      return 0
    })
  }, [selectedCategory, searchQuery, salaryFilter, educationFilter, workEnvFilter, growthFilter, sortBy])

  const categories = [
    'All',
    'High Match (85%+)',
    'Tech & Design',
    'Emerging AI Careers',
    'Business & Leadership',
    'Healthcare',
  ]

  return (
    <PortalLayout title="Explore Careers" subtitle="Curated catalog of modern career trajectories">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
        {/* ================= Header & Cognitive Blend ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f46e5] px-2.5 py-0.5 rounded-md bg-[#eaedff]">
                Curated Explorer
              </span>
              <span className="text-xs text-[#777587]">
                • Indexed with verified industry labor metrics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
              Explore Careers
            </h1>
            <p className="text-sm text-[#464555] max-w-3xl leading-relaxed">
              Discover curated career pathways mapped to your{' '}
              <span className="font-semibold text-[#4f46e5]">IAS archetype</span> and cognitive strengths. All salary trajectories verified via Q1 labor statistics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-white border border-[#c7c4d8]/70 px-4 py-2.5 rounded-2xl shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#4f46e5]">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#777587]">Your Dominant Blend</p>
              <p className="text-xs sm:text-sm font-bold text-[#131b2e]">Investigative + Artistic (IAS)</p>
            </div>
          </div>
        </div>

        {/* ================= Category Filters ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${isSelected
                    ? 'bg-[#4f46e5] text-white shadow-sm'
                    : 'bg-white border border-[#c7c4d8]/70 text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                  }`}
              >
                {cat === 'High Match (85%+)' && (
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                )}
                {cat === 'Tech & Design' && (
                  <span className="material-symbols-outlined text-[15px]">design_services</span>
                )}
                {cat === 'Emerging AI Careers' && (
                  <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                )}
                {cat === 'Business & Leadership' && (
                  <span className="material-symbols-outlined text-[15px]">leaderboard</span>
                )}
                {cat === 'Healthcare' && (
                  <span className="material-symbols-outlined text-[15px]">local_hospital</span>
                )}
                <span>{cat}</span>
              </button>
            )
          })}
        </div>

        {/* ================= Structured Filter Bar ================= */}
        <div className="bg-white rounded-2xl border border-[#c7c4d8]/70 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Query */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
              Keyword or Skill
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#777587] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Figma, Python, AI..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-[#f2f3ff] border border-[#c7c4d8]/70 rounded-xl text-[#131b2e] placeholder-[#777587] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Filter 1: Expected Salary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#777587] uppercase tracking-wider flex items-center justify-between">
              <span>Expected Salary</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#777587] pointer-events-none">
                payments
              </span>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-7 text-xs bg-[#f2f3ff] border border-[#c7c4d8]/70 rounded-xl text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="All">All Compensation Tiers</option>
                <option value="over-100k">Above $100,000 / yr</option>
                <option value="over-130k">Above $130,000+ / yr</option>
              </select>
            </div>
          </div>

          {/* Filter 2: Education Requirement */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
              Education Requirement
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#777587] pointer-events-none">
                school
              </span>
              <select
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-7 text-xs bg-[#f2f3ff] border border-[#c7c4d8]/70 rounded-xl text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="All">All Degree Pathways</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's / Ph.D.</option>
              </select>
            </div>
          </div>

          {/* Filter 3: Work Environment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
              Work Environment
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#777587] pointer-events-none">
                home_work
              </span>
              <select
                value={workEnvFilter}
                onChange={(e) => setWorkEnvFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-7 text-xs bg-[#f2f3ff] border border-[#c7c4d8]/70 rounded-xl text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="All">All Environments</option>
                <option value="Remote">Remote-First</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Lab">Lab / Research</option>
              </select>
            </div>
          </div>

          {/* Filter 4: Growth Outlook */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
              Job Growth Outlook
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#777587] pointer-events-none">
                trending_up
              </span>
              <select
                value={growthFilter}
                onChange={(e) => setGrowthFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-7 text-xs bg-[#f2f3ff] border border-[#c7c4d8]/70 rounded-xl text-[#131b2e] focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="All">All Trajectories</option>
                <option value="high">High Growth (+15%+)</option>
                <option value="surge">Surge Growth (+20%+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= Results Summary Bar ================= */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm text-[#464555]">
            Showing <span className="font-bold text-[#131b2e]">{filteredCareers.length}</span> pathways matching your criteria
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777587] hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-[#4f46e5] bg-white border border-[#c7c4d8]/70 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="match">Cognitive Compatibility (Highest)</option>
              <option value="salary">Salary (Highest to Lowest)</option>
              <option value="growth">Growth Outlook (Fastest)</option>
              <option value="name">Title (A to Z)</option>
            </select>
          </div>
        </div>

        {/* ================= Career Cards Grid ================= */}
        {filteredCareers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#c7c4d8]/70 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#777587] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h3 className="text-base font-bold text-[#131b2e]">No matching careers found</h3>
            <p className="text-xs text-[#777587] mt-1 max-w-sm mx-auto">
              Try adjusting your filter options or search term to discover more career trajectories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
                setSalaryFilter('All')
                setEducationFilter('All')
                setGrowthFilter('All')
              }}
              className="mt-4 px-4 py-2 bg-[#eaedff] text-[#4f46e5] text-xs font-semibold rounded-xl hover:bg-[#e2dfff] transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCareers.map((career) => {
              const isSaved = savedIds.includes(career.id)

              return (
                <article
                  key={career.id}
                  className="bg-white border border-[#c7c4d8]/70 rounded-2xl p-6 flex flex-col justify-between card-shadow transition-all duration-200 hover:-translate-y-1 hover:border-[#c3c0ff] relative"
                >
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Icon, Holland Code, Bookmark */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${career.iconBg} ${career.iconColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {career.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#4f46e5] font-bold text-[10px]">
                              {career.code}
                            </span>
                            <span className="text-[11px] text-[#777587] font-medium">
                              {career.archetype}
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-[#131b2e] tracking-tight mt-0.5">
                            {career.title}
                          </h2>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleSave(career.id, career.title)}
                        aria-label={isSaved ? 'Remove from saved' : 'Save career'}
                        title={isSaved ? 'Remove from saved' : 'Save career'}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSaved
                            ? 'bg-[#eaedff] text-[#4f46e5]'
                            : 'bg-[#f2f3ff] text-[#777587] hover:bg-[#eaedff] hover:text-[#4f46e5]'
                          }`}
                      >
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{
                            fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          bookmark
                        </span>
                      </button>
                    </div>

                    {/* Match Badge & Growth Outlook */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">
                          auto_awesome
                        </span>
                        <span className="text-xs font-bold">{career.matchScore}% Match</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#464555] border border-[#c7c4d8]/60">
                        <span className="material-symbols-outlined text-[14px] text-[#4f46e5]">
                          trending_up
                        </span>
                        <span className="text-xs font-medium text-emerald-700">
                          {career.growth}
                        </span>
                      </div>
                    </div>

                    {/* Salary & Work Mode */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8]/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-[#777587] tracking-wider">
                          Median Salary
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#131b2e]">
                          {career.salaryRange}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-white text-[#464555] border border-[#c7c4d8]/70">
                        {career.workMode}
                      </span>
                    </div>

                    {/* Match Reasoning */}
                    <div className="text-xs text-[#464555] leading-relaxed line-clamp-2">
                      <span className="font-semibold text-[#4f46e5]">Why you match:</span>{' '}
                      {career.matchReason}
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {career.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#464555] text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4 mt-4 border-t border-[#c7c4d8]/60">
                    <button
                      onClick={() => setSelectedCareerModal(career)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:bg-[#3525cd] transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      <span>View Pathway & Roadmap</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* ================= Career Roadmap Modal ================= */}
        {selectedCareerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#c7c4d8] shadow-2xl p-6 sm:p-8 relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCareerModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f2f3ff] text-[#777587] hover:text-[#131b2e] hover:bg-[#eaedff] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${selectedCareerModal.iconBg} ${selectedCareerModal.iconColor} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {selectedCareerModal.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#4f46e5] font-bold text-xs">
                      {selectedCareerModal.code}
                    </span>
                    <span className="text-xs font-semibold text-[#777587]">
                      {selectedCareerModal.archetype}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#131b2e]">
                    {selectedCareerModal.title}
                  </h2>
                </div>
              </div>

              {/* Highlights strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#f2f3ff] rounded-2xl mb-6 text-center">
                <div>
                  <span className="text-[10px] text-[#777587] block uppercase font-bold">Match</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {selectedCareerModal.matchScore}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777587] block uppercase font-bold">Salary</span>
                  <span className="text-sm font-bold text-[#131b2e]">
                    {selectedCareerModal.salaryRange}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777587] block uppercase font-bold">Growth</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {selectedCareerModal.growth}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777587] block uppercase font-bold">Work Mode</span>
                  <span className="text-sm font-bold text-[#131b2e]">
                    {selectedCareerModal.workMode}
                  </span>
                </div>
              </div>

              {/* Academic & Certifications Requirement */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                    Recommended Education & Degree
                  </h3>
                  <p className="text-xs text-[#464555] bg-[#faf8ff] p-3 rounded-xl border border-[#c7c4d8]/60">
                    {selectedCareerModal.recommendedDegree}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                    Target Industry Certifications
                  </h3>
                  <p className="text-xs text-[#464555] bg-[#faf8ff] p-3 rounded-xl border border-[#c7c4d8]/60">
                    {selectedCareerModal.certifications}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                    Typical Day-in-the-Life
                  </h3>
                  <p className="text-xs text-[#464555] bg-[#faf8ff] p-3 rounded-xl border border-[#c7c4d8]/60">
                    {selectedCareerModal.dailyBreakdown}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Roadmap */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-3">
                  Student-to-Professional Roadmap
                </h3>
                <div className="space-y-3">
                  {selectedCareerModal.roadmapSteps.map((stepItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#c7c4d8]/70"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131b2e]">
                          {stepItem.step}
                        </div>
                        <div className="text-xs text-[#777587] mt-0.5">
                          {stepItem.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#c7c4d8]/70">
                <button
                  onClick={() => {
                    handleToggleSave(selectedCareerModal.id, selectedCareerModal.title)
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#c7c4d8] text-xs font-bold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{
                      fontVariationSettings: savedIds.includes(selectedCareerModal.id)
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    bookmark
                  </span>
                  <span>
                    {savedIds.includes(selectedCareerModal.id) ? 'Shortlisted' : 'Save to Shortlist'}
                  </span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    to="/saved"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:bg-[#3525cd] transition-colors cursor-pointer"
                  >
                    <span>Go to Saved Careers</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
