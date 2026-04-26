import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  isAuthenticated,
  getStoredUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('corretora_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await loginService(email, password);
      setToken(data.token);
      setUser({ name: data.name, email: data.email, role: data.role });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerService(name, email, password);
      setToken(data.token);
      setUser({ name: data.name, email: data.email, role: data.role });
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
