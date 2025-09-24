import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { http } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await http.get('/auth/me');
      setUser(data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    await http.post('/auth/login', { email, password });
    await fetchMe();
  };

  const register = async (payload) => {
    await http.post('/auth/register', payload);
    await fetchMe();
  };

  const logout = async () => {
    await http.post('/auth/logout');
    setUser(null);
  };

  const updateInterests = async (interests) => {
    const { data } = await http.put('/auth/interests', { interests });
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateInterests }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


