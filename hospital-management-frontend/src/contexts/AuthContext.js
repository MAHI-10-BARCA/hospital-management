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
    console.log('🔐 AuthProvider - Token exists:', !!token);
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('🔄 Loading user profile...');
      const userData = await authService.getProfile();
      console.log('👤 Profile API response:', userData);
      
      // The profile endpoint returns the full User entity with ID
      if (!userData.id) {
        console.error('❌ No user ID found in profile response!');
        throw new Error('User ID not found in profile data');
      }
      
      setUser(userData);
      console.log('✅ User profile loaded successfully:', userData);
      
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await authService.login(credentials);
      console.log('✅ Login API response:', response);
      
      // ✅ FIX: The response now contains token, id, username, and roles
      const { token, id, username, roles } = response;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      
      // Create user object from login response
      const userData = {
        id: id,
        username: username,
        roles: roles
      };
      
      console.log('👤 User data from login:', userData);
      
      if (!userData.id) {
        throw new Error('User ID not found in login response');
      }
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    
    // Handle both "ROLE_ADMIN" and "ADMIN" formats
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.includes(normalizedRole);
  };

  // Check if user is admin (for booking restrictions)
  const isAdmin = () => hasRole('ADMIN');

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;