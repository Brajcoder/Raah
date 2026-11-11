import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortalLayout } from '../components/PortalLayout'
import { startQuiz, submitQuiz } from '../lib/api'
import { ASSESSMENT_CATEGORIES, ASSESSMENTS } from '../data/assessmentsData'
import toast from 'react-hot-toast'

const LOADING_STEPS = [
  'Consulting Gemini AI psychometric model...',
  'Formulating 10 calibrated situational scenarios...',
  'Balancing the 6 cognitive trait dimensions...',
  'Finalizing your customized assessment...',
]

export const TakeAssessment = () => {
  const navigate = useNavigate()

  // Phase: 'CATALOG' | 'GENERATING' | 'QUIZ' | 'SUBMITTING'
  const [phase, setPhase] = useState('CATALOG')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTest, setSelectedTest] = useState(null)
  const [loadingStepIdx, setLoadingStepIdx] = useState(0)

  // Active Quiz State
  const [quizId, setQuizId] = useState(null)
  const [activeTestName, setActiveTestName] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [qIdx]: optionIdx (0-3) }

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return ASSESSMENTS.filter((test) => {
      const matchesCategory =
        selectedCategory === 'all' || test.categoryId === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        test.name.toLowerCase().includes(query) ||
        test.categoryName.toLowerCase().includes(query) ||
        test.description.toLowerCase().includes(query) ||
        test.measures.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Handlers for Starting an Assessment
  const handleStartAssessment = async (test) => {
    if (!test) return
    setSelectedTest(test)
    setPhase('GENERATING')
    setLoadingStepIdx(0)

    // Progress animation ticker
    const timer = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 1800)

    try {
      const data = await startQuiz(test.name)
      clearInterval(timer)

      if (!data.questions || data.questions.length !== 10) {
        throw new Error('Received unexpected assessment format from generator.')
      }

      setQuizId(data.quiz_id)
      setActiveTestName(data.field || test.name)
      setQuestions(data.questions)
      setCurrentIndex(0)
      setSelectedAnswers({})
      setPhase('QUIZ')
      toast.success(`Generated 10-question evaluation for "${test.name}"! 🎯`)
    } catch (err) {
      clearInterval(timer)
      setPhase('CATALOG')
      toast.error(err.message || 'Failed to generate assessment. Please try again.')
    }
  }

  // Handlers for Quiz Answering
  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }))
  }

  const handleNext = () => {
    if (selectedAnswers[currentIndex] === undefined) {
      toast('Please choose an option to continue.', { icon: '👆' })
      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    const answersArray = []
    for (let i = 0; i < 10; i++) {
      if (selectedAnswers[i] === undefined) {
        toast.error(`Please answer question ${i + 1} before submitting.`)
        setCurrentIndex(i)
        return
      }
      answersArray.push(selectedAnswers[i])
    }

    setPhase('SUBMITTING')

    try {
      const result = await submitQuiz(quizId, answersArray)
      localStorage.setItem('raah_active_result', JSON.stringify(result))
      toast.success('Assessment evaluated successfully! ✨')
      navigate('/results', { state: { result } })
    } catch (err) {
      setPhase('QUIZ')
      toast.error(err.message || 'Failed to evaluate assessment responses.')
    }
  }

  // ==================== RENDER: PHASE 1 (ASSESSMENT CATALOG) ====================
  if (phase === 'CATALOG') {
    return (
      <PortalLayout
        title="Assessment Center"
        subtitle="15 scientifically calibrated psychometric evaluations across 5 core dimensions"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f46e5]/10 via-[#7c3aed]/5 to-transparent border border-[#c3c0ff]/60 p-6 sm:p-8 card-shadow backdrop-blur-[2px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaedff] text-[#3525cd] text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  <span>Select an Assessment Module</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  Choose Your Discovery Focus
                </h2>
                <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                  Select any test below to assess your cognitive orientation, vocational affinities, and workplace traits. Gemini AI will generate 10 unique, practical situations to evaluate your optimal career trajectory.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-72 shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777587] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 15 assessments..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-[#c7c4d8] rounded-2xl text-xs sm:text-sm font-medium text-[#131b2e] placeholder-[#777587] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#131b2e]"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none">
              {ASSESSMENT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                const count =
                  cat.id === 'all'
                    ? ASSESSMENTS.length
                    : ASSESSMENTS.filter((a) => a.categoryId === cat.id).length

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-[#4f46e5] text-white shadow-md scale-102'
                        : 'bg-white/70 hover:bg-white text-[#464555] border border-[#c7c4d8]/60 hover:text-[#131b2e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#eaedff] text-[#4f46e5]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Assessment Cards Grid */}
          {filteredAssessments.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white/20 rounded-3xl border border-white/60">
              <span className="material-symbols-outlined text-4xl text-[#777587]">
                search_off
              </span>
              <p className="text-sm font-semibold text-[#464555]">
                No assessments found matching "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="px-4 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssessments.map((test) => (
                <article
                  key={test.id}
                  className="group relative bg-white/40 hover:bg-white/80 backdrop-blur-[2px] border border-white/70 hover:border-[#c3c0ff] rounded-3xl p-6 card-shadow transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category Badge & Duration */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${test.badgeColor}`}
                      >
                        {test.categoryName}
                      </span>
                      <span className="text-[11px] font-semibold text-[#777587] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">
                          schedule
                        </span>
                        <span>{test.duration}</span>
                      </span>
                    </div>

                    {/* Test Icon & Title */}
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-10 h-10 rounded-2xl bg-[#eaedff] text-[#4f46e5] flex items-center justify-center shrink-0 border border-[#c3c0ff]/60 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-xl">
                          {test.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#131b2e] tracking-tight group-hover:text-[#4f46e5] transition-colors">
                          {test.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#464555] line-clamp-1">
                          {test.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#5f5d6e] leading-relaxed line-clamp-3">
                      {test.description}
                    </p>

                    {/* Measured Competencies */}
                    <div className="pt-2 border-t border-[#c7c4d8]/40">
                      <div className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1.5">
                        Focus Areas
                      </div>
                      <p className="text-xs text-[#464555] italic line-clamp-2">
                        {test.measures}
                      </p>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleStartAssessment(test)}
                      className="w-full py-2.5 px-4 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 group-hover:shadow-md"
                    >
                      <span>Start Assessment</span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </PortalLayout>
    )
  }

  // ==================== RENDER: GENERATING OR SUBMITTING LOADING ====================
  if (phase === 'GENERATING' || phase === 'SUBMITTING') {
    const isGenerating = phase === 'GENERATING'
    return (
      <PortalLayout
        title={isGenerating ? 'Synthesizing Assessment' : 'Analyzing Responses'}
        subtitle="Raah AI is formulating your personalized guidance"
      >
        <div className="max-w-md mx-auto py-16 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full border-4 border-[#eaedff] border-t-[#4f46e5] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#4f46e5] animate-pulse">
                {isGenerating ? 'psychology' : 'insights'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#131b2e]">
              {isGenerating
                ? `Crafting "${selectedTest?.name || 'Assessment'}"`
                : 'Scoring & Consulting Gemini AI'}
            </h3>
            <p className="text-xs sm:text-sm text-[#464555] transition-all duration-300">
              {isGenerating
                ? LOADING_STEPS[loadingStepIdx]
                : 'Mapping responses across the 6 cognitive traits and building career trajectories...'}
            </p>
          </div>

          <div className="w-48 mx-auto bg-[#eaedff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4f46e5] h-full rounded-full animate-pulse" style={{ width: '80%' }} />
          </div>
        </div>
      </PortalLayout>
    )
  }

  // ==================== RENDER: PHASE 2 (10-QUESTION MCQ QUIZ) ====================
  const currentQ = questions[currentIndex] || {}
  const totalQuestions = questions.length
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100)
  const isLastQuestion = currentIndex === totalQuestions - 1
  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <PortalLayout
      title={activeTestName || 'Career Assessment'}
      subtitle={`Question ${currentIndex + 1} of ${totalQuestions}`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Card */}
        <section className="bg-white/30 backdrop-blur-[2px] border border-white/60 rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#3525cd] font-bold text-[11px]">
                {activeTestName}
              </span>
              <span className="font-semibold text-[#464555]">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
            <span className="font-bold text-[#4f46e5]">{progressPercent}% Completed</span>
          </div>

          <div className="w-full h-2 bg-[#eaedff] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3525cd] to-[#4f46e5] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        {/* Question Card */}
        <section className="bg-white/40 backdrop-blur-[2px] border border-white/70 rounded-3xl p-6 sm:p-8 card-shadow space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4f46e5] uppercase tracking-wider">
              Scenario {currentIndex + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#131b2e] leading-relaxed">
              {currentQ.q}
            </h3>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-3">
            {(currentQ.options || []).map((optText, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#4f46e5] bg-[#eaedff]/90 ring-2 ring-[#4f46e5]/40 shadow-sm'
                      : 'border-white/80 bg-white/60 hover:bg-white text-[#131b2e]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-[#4f46e5] text-white shadow-xs'
                        : 'bg-[#eaedff] text-[#4f46e5]'
                    }`}
                  >
                    {optionLabels[optIdx]}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                    {optText}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[#4f46e5] text-lg shrink-0">
                      check_circle
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#c7c4d8]/40">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-[#c7c4d8] text-xs font-semibold text-[#464555] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>

            {/* Jump Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#4f46e5]'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-[#10b981]'
                      : 'bg-[#c7c4d8]'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span>{isLastQuestion ? 'Submit & View Advice' : 'Next Question'}</span>
              <span className="material-symbols-outlined text-sm">
                {isLastQuestion ? 'done_all' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </PortalLayout>
  )
}
