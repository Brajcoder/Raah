import { apiFetch } from './api.js';

export async function fetchUserResults() {
  return apiFetch('/api/results');
}

export async function fetchCurrentUser() {
  return apiFetch('/auth/me');
}
