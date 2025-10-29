import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import profileService from '../services/profileService';

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
  const [profile, setProfile] = useState(null);
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
      
      // Load detailed profile
      try {
        const detailedProfile = await profileService.getCurrentProfile();
        setProfile(detailedProfile);
        console.log('✅ Detailed profile loaded:', detailedProfile);
      } catch (profileError) {
        console.log('⚠️ Could not load detailed profile, using basic user data');
        setProfile(userData);
      }
      
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
      
      const { token, id, username, roles } = response;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      
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
      
      // Load detailed profile after login
      try {
        const detailedProfile = await profileService.getCurrentProfile();
        setProfile(detailedProfile);
      } catch (profileError) {
        console.log('⚠️ Could not load detailed profile immediately after login');
        setProfile(userData);
      }
      
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
    setProfile(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await profileService.updateUserProfile(profileData);
      setProfile(updatedProfile);
      return { success: true, profile: updatedProfile };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const detailedProfile = await profileService.getCurrentProfile();
      setProfile(detailedProfile);
      return detailedProfile;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.includes(normalizedRole);
  };

  // Check user type
  const isAdmin = () => hasRole('ADMIN');
  const isDoctor = () => hasRole('DOCTOR');
  const isPatient = () => hasRole('PATIENT');

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    hasRole,
    isAdmin,
    isDoctor,
    isPatient,
    loadUserProfile
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;