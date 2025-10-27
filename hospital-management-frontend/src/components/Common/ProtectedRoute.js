import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { hasPermission, hasRole } from '../../utils/helpers';

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(user, requiredRole)) {
    console.log(`❌ Access denied: User ${user.username} lacks required role ${requiredRole}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    console.log(`❌ Access denied: User ${user.username} lacks permission ${requiredPermission}`);
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;