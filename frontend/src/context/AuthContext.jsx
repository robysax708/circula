// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken } from '../services/api.js';

const AuthContext = createContext(null);
const KEY = 'circula_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(KEY);
    if (!token) { setLoading(false); return; }
    setAuthToken(token);
    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => { sessionStorage.removeItem(KEY); setAuthToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login({ email, password });
    sessionStorage.setItem(KEY, token);
    setAuthToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => { await api.register(data); }, []);
  const registerProducer = useCallback(async (data) => { await api.registerProducer(data); }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user } = await api.me();
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerProducer, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
