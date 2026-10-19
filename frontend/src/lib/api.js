import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Retrieves authorization headers with the active Supabase JWT session token.
 */
async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || localStorage.getItem('raah_token') || ''
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

/**
 * Centralized API requester with robust error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const headers = await getHeaders()
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })

  // Handle 401 Unauthorized
  if (response.status === 401) {
    throw new Error('Your session has expired or is unauthorized. Please sign in again.')
  }

  // Handle 429 Too Many Requests
  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Rate limit reached. Please wait a moment before trying again.')
  }

  // Handle 422 Unprocessable Content / Domain Errors
  if (response.status === 422) {
    const errorData = await response.json().catch(() => ({}))
    const msg = typeof errorData.detail === 'string'
      ? errorData.detail
      : Array.isArray(errorData.detail)
      ? errorData.detail.map(d => d.msg).join(', ')
      : 'Invalid input. Please enter a recognized academic field or stream.'
    throw new Error(msg)
  }

  // Handle 502 Bad Gateway (LLM failure)
  if (response.status === 502) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'AI quiz generation timed out. Please retry with your field.')
  }

  // Handle other HTTP errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}

// ==================== QUIZ & AI GUIDANCE ====================

/**
 * Starts a dynamic field quiz (Gemini generates 10 questions).
 * @param {string} field - Free text stream/course name (e.g. "BSc Physics")
 * @returns {Promise<{quiz_id: string, field: string, questions: Array<{q: string, options: string[]}>}>}
 */
export async function startQuiz(field) {
  return apiRequest('/api/quiz/start', {
    method: 'POST',
    body: JSON.stringify({ field }),
  })
}

/**
 * Submits 10 question answers (each 0-3).
 * @param {string} quiz_id - The active quiz UUID
 * @param {number[]} answers - 10 selected option indices [0-3]
 * @returns {Promise<{id: string, field: string, profile: Array<{trait: string, score: number}>, ai: Object}>}
 */
export async function submitQuiz(quiz_id, answers) {
  return apiRequest('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ quiz_id, answers }),
  })
}

// ==================== DASHBOARD & PROFILE ====================

/**
 * Retrieves the authenticated student's profile.
 * @returns {Promise<{id: string, email: string, name: string}>}
 */
export async function getMe() {
  return apiRequest('/api/me')
}

/**
 * Retrieves dashboard summary data ({attempts, latest, top_trait}).
 * @returns {Promise<{attempts: number, latest: Object|null, top_trait: string|null}>}
 */
export async function getDashboard() {
  return apiRequest('/api/dashboard')
}

// ==================== ASSESSMENT RESULTS ====================

/**
 * Retrieves all past results for the current user.
 */
export async function getResults() {
  return apiRequest('/api/results')
}

/**
 * Retrieves a single result by UUID.
 */
export async function getResultById(id) {
  return apiRequest(`/api/results/${id}`)
}

/**
 * Deletes a result by UUID (only caller's own row).
 */
export async function deleteResult(id) {
  return apiRequest(`/api/results/${id}`, {
    method: 'DELETE',
  })
}
