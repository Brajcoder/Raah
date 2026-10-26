import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortalLayout } from '../components/PortalLayout'
import { startQuiz, submitQuiz } from '../lib/api'
import toast from 'react-hot-toast'

const POPULAR_FIELDS = [
  'BSc Physics',
  'B.Tech CSE',
  'BCom Finance',
  'BCA Software',
  'Interior Design',
  '12th pass (Science)',
  '12th pass (Commerce)',
  'Biotechnology',
  'BA Psychology',
  'Data Science',
]

const LOADING_STEPS = [
  'Consulting Gemini AI knowledge base...',
  'Formulating 10 practical field scenarios...',
  'Balancing cognitive trait metrics...',
  'Finalizing your customized assessment...',
]

export const TakeAssessment = () => {
  const navigate = useNavigate()

  // Phase: 'ENTRY' | 'GENERATING' | 'QUIZ' | 'SUBMITTING'
  const [phase, setPhase] = useState('ENTRY')
  const [fieldInput, setFieldInput] = useState('')
  const [loadingStepIdx, setLoadingStepIdx] = useState(0)

  // Quiz state
  const [quizId, setQuizId] = useState(null)
  const [activeField, setActiveField] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [qIdx]: optionIdx (0-3) }

  // Handlers for Field Entry
  const handleStartGeneration = async (fieldToUse) => {
    const targetField = (fieldToUse || fieldInput).trim()
    if (!targetField) {
      toast.error('Please enter a course, degree, or stream name.')
      return
    }

    setPhase('GENERATING')
    setLoadingStepIdx(0)

    // Progress animation ticker
    const timer = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 1800)

    try {
      const data = await startQuiz(targetField)
      clearInterval(timer)

      if (!data.questions || data.questions.length !== 10) {
        throw new Error('Received unexpected quiz format from generator.')
      }

      setQuizId(data.quiz_id)
      setActiveField(data.field)
      setQuestions(data.questions)
      setCurrentIndex(0)
      setSelectedAnswers({})
      setPhase('QUIZ')
      toast.success(`Generated 10-question quiz for "${data.field}"! 🎯`)
    } catch (err) {
      clearInterval(timer)
      setPhase('ENTRY')
      toast.error(err.message || 'Failed to generate quiz. Please try again.')
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
    // Verify all 10 questions answered
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
      // Save latest active result in localStorage for instant rendering
      localStorage.setItem('raah_active_result', JSON.stringify(result))
      toast.success('Assessment evaluated successfully! ✨')
      navigate('/results', { state: { result } })
    } catch (err) {
      setPhase('QUIZ')
      toast.error(err.message || 'Failed to evaluate quiz responses.')
    }
  }

  // ==================== RENDER: PHASE 1 (FIELD ENTRY) ====================
  if (phase === 'ENTRY') {
    return (
      <PortalLayout
        title="Field-Specific Career Assessment"
        subtitle="Dynamic AI-generated psychometric inventory tailored to your discipline"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Hero Card */}
          <section className="bg-white/20 backdrop-blur-[2px] border border-white/60 rounded-3xl p-6 md:p-10 card-shadow text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#eaedff]/70 text-[#4f46e5] flex items-center justify-center mx-auto border border-[#c3c0ff]/60 shadow-xs">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaedff] text-[#3525cd] text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Powered by Google Gemini</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                What stream or degree are you in?
              </h2>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Type any course, degree, or area of interest (e.g. <em>BSc Physics, BCom, BCA, interior design, 12th pass</em>). Raah will dynamically generate 10 real-world industry scenarios to discover your optimal career trajectories.
              </p>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleStartGeneration()
              }}
              className="max-w-lg mx-auto space-y-3"
            >
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-xl">
                  school
                </span>
                <input
                  type="text"
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  placeholder="e.g. BSc Physics, BCom, BCA, Interior Design..."
                  maxLength={60}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/70 border border-[#c7c4d8] rounded-2xl text-sm font-medium text-[#131b2e] placeholder-[#777587] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Generate Customized Assessment</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Quick-Pick Popular Suggestions */}
            <div className="pt-4 border-t border-[#c7c4d8]/40 space-y-3">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider block">
                Or pick a popular stream to test:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_FIELDS.map((pField) => (
                  <button
                    key={pField}
                    type="button"
                    onClick={() => {
                      setFieldInput(pField)
                      handleStartGeneration(pField)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/50 hover:bg-white border border-[#c7c4d8]/60 text-xs font-semibold text-[#464555] hover:text-[#4f46e5] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {pField}
                  </button>
                ))}
              </div>
            </div>
          </section>
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
              {isGenerating ? `Crafting Quiz for "${fieldInput}"` : 'Scoring & Consulting Gemini AI'}
            </h3>
            <p className="text-xs sm:text-sm text-[#464555] transition-all duration-300">
              {isGenerating
                ? LOADING_STEPS[loadingStepIdx]
                : 'Mapping responses to 6 cognitive traits and building career trajectories...'}
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
      title={`Career Assessment • ${activeField}`}
      subtitle={`Question ${currentIndex + 1} of ${totalQuestions}`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Card */}
        <section className="bg-white/30 backdrop-blur-[2px] border border-white/60 rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#3525cd] font-bold text-[11px]">
                {activeField}
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
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${isSelected
                      ? 'border-[#4f46e5] bg-[#eaedff]/90 ring-2 ring-[#4f46e5]/40 shadow-sm'
                      : 'border-white/80 bg-white/60 hover:bg-white text-[#131b2e]'
                    }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${isSelected
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
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === currentIndex
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
