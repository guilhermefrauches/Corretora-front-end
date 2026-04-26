import api from './api';

const TOKEN_KEY = 'corretora_token';
const USER_KEY = 'corretora_user';

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email, role: data.role }));
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email, role: data.role }));
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me');
  return data;
}
