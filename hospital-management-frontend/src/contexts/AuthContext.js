import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 AuthProvider init - Token exists:', !!token);
    
    if (token) {
      console.log('🔄 Fetching user profile...');
      loadUserProfile();
    } else {
      console.log('🚫 No token found');
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      console.log('✅ Profile data received:', userData);
      console.log('✅ User roles:', userData.roles);
      console.log('✅ User ID:', userData.id);
      setUser(userData);
    } catch (error) {
      console.error('❌ Profile load failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // If profile fails, clear the invalid token
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    console.log('🔑 Login attempt for:', credentials.username);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      console.log('✅ Login successful, token saved');
      
      // Load user profile after successful login
      await loadUserProfile();
      return user; // Return the user after profile is loaded
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    await authService.register(userData);
  };

  const logout = () => {
    console.log('🚪 Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};