import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getMe,
  updateMe as updateMeService,
} from '../services/authService';

const TOKEN_KEY = 'corretora_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setInitializing(false);
      return;
    }

    getMe()
      .then((me) => {
        setUser({ name: me.name, email: me.email, role: me.role });
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('corretora_user');
        setUser(null);
        setToken(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await loginService(email, password);
      const me = await getMe();
      setToken(data.token);
      setUser({ name: me.name, email: me.email, role: me.role });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerService(name, email, password);
      const me = await getMe();
      setToken(data.token);
      setUser({ name: me.name, email: me.email, role: me.role });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await updateMeService(payload);
    setUser({ name: data.name, email: data.email, role: data.role });
    return data;
  }, []);

  if (initializing) return null;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
