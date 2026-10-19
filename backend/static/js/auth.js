// Auth Manager: Login, Signup, Logout, and Token Storage
import { apiFetch } from './api.js';

export const Auth = {
  getToken() {
    return localStorage.getItem('raah_token');
  },

  getUser() {
    const raw = localStorage.getItem('raah_user');
    return raw ? JSON.parse(raw) : null;
  },

  async login(email, password) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      localStorage.setItem('raah_token', res.token);
    }
    if (res.user) {
      localStorage.setItem('raah_user', JSON.stringify(res.user));
    }
    return res;
  },

  async signup(email, password, fullName) {
    return apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName })
    });
  },

  logout() {
    localStorage.removeItem('raah_token');
    localStorage.removeItem('raah_user');
    window.location.href = '/static/login.html';
  }
};
