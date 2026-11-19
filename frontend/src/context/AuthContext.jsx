import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { authTokenStorageKey } from '../api/axios';

const AuthContext = createContext(null);

function saveAuthToken(token) {
  if (token) sessionStorage.setItem(authTokenStorageKey, token);
  else sessionStorage.removeItem(authTokenStorageKey);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        if (error.response?.status === 401) saveAuthToken(null);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    saveAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      saveAuthToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    loading,
    login,
    register,
    logout,
    updateUser: setUser
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
