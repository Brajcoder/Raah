// Careers Catalog cleared per user request
export const CAREERS_DATA = []

const STORAGE_KEY = 'career_compass_saved_careers'
const RESULTS_KEY = 'raah_assessment_results'

export const getSavedCareerIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to read saved careers', err)
  }
  return []
}

export const toggleSaveCareerId = (id) => {
  const current = getSavedCareerIds()
  let updated
  if (current.includes(id)) {
    updated = current.filter((x) => x !== id)
  } else {
    updated = [...current, id]
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save career ids', err)
  }
  return updated
}

export const getAssessmentResult = () => {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to read assessment result', err)
  }
  return null
}

export const saveAssessmentResult = (data) => {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to persist assessment result', err)
  }
}

export const clearAssessmentResult = () => {
  try {
    localStorage.removeItem(RESULTS_KEY)
  } catch (err) {
    console.error('Failed to clear assessment', err)
  }
}
