import { apiFetch } from './api.js';

export async function loadQuizQuestions() {
  return apiFetch('/api/questions');
}

export async function submitQuizAnswers(answersMap) {
  return apiFetch('/api/recommend', {
    method: 'POST',
    body: JSON.stringify({ answers: answersMap })
  });
}
