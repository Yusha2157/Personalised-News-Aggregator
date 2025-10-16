import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { http } from '../api/http.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await http.get('/auth/profile');
      setUser(data.user);
    } catch (error) {
      setUser(null);
      // Clear tokens if profile fetch fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    try {
      const { data } = await http.post('/auth/login', { email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Set user data
      setUser(data.user);
      
      toast.success('Login successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await http.post('/auth/register', payload);
      
      // Store tokens
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Set user data
      setUser(data.user);
      
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await http.put('/auth/profile', profileData);
      setUser(data.user);
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await http.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  const saveArticle = async (articleId) => {
    try {
      await http.post('/users/saved-articles', { articleId });
      toast.success('Article saved!');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to save article';
      toast.error(message);
      throw error;
    }
  };

  const unsaveArticle = async (articleId) => {
    try {
      await http.delete(`/users/saved-articles/${articleId}`);
      toast.success('Article removed from saved!');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to unsave article';
      toast.error(message);
      throw error;
    }
  };

  const getSavedArticles = async (params = {}) => {
    try {
      const { data } = await http.get('/users/saved-articles', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch saved articles:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      changePassword,
      saveArticle,
      unsaveArticle,
      getSavedArticles,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


