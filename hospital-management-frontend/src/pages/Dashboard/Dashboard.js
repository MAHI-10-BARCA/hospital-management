import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { Alert, Box, Typography, Paper } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();

  console.log('🔍 Dashboard component rendered');
  console.log('👤 Current user:', user);
  console.log('🎭 User roles:', user?.roles);

  // Simple role detection
  const getUserRole = () => {
    if (!user || !user.roles) return 'PATIENT';
    
    if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user.roles.includes('ROLE_DOCTOR')) return 'DOCTOR';
    if (user.roles.includes('ROLE_PATIENT')) return 'PATIENT';
    if (user.roles.includes('ROLE_USER')) return 'PATIENT';
    
    return 'PATIENT';
  };

  const userRole = getUserRole();
  console.log('🎯 Dashboard role detected:', userRole);

  // Render appropriate dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'ADMIN':
        return <AdminDashboard user={user} stats={{}} recentAppointments={[]} />;
      case 'DOCTOR':
        return <DoctorDashboard user={user} stats={{}} recentAppointments={[]} />;
      case 'PATIENT':
        return <PatientDashboard user={user} stats={{}} recentAppointments={[]} />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Unknown user role: {userRole}
            </Alert>
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h4">Debug Info</Typography>
              <Typography>User: {user?.username}</Typography>
              <Typography>Roles: {user?.roles?.join(', ')}</Typography>
            </Paper>
          </Box>
        );
    }
  };

  return (
    <Box>
      {renderDashboard()}
    </Box>
  );
};

export default Dashboard;