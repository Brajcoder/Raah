// API Helper with Bearer token authentication wrapper
const API_BASE = '';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('raah_token') || localStorage.getItem('careercompass_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
