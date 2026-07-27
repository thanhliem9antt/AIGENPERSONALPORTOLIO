import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const value = useMemo(() => ({
    user, loading, setUser, refresh,
    login: async (values) => {
      const { data } = await api.post('/auth/login', values);
      setUser(data.user);
      return data.user;
    },
    register: async (values) => {
      const { data } = await api.post('/auth/register', values);
      setUser(data.user);
      return data.user;
    },
    logout: async () => {
      await api.post('/auth/logout');
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
