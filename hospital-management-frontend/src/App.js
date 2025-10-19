import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DoctorsList from './pages/Doctors/DoctorsList';
import AddDoctor from './pages/Doctors/AddDoctor';
import EditDoctor from './pages/Doctors/EditDoctor';
import PatientsList from './pages/Patients/PatientsList';
import AddPatient from './pages/Patients/AddPatient';
import EditPatient from './pages/Patients/EditPatient';
import AppointmentsList from './pages/Appointments/AppointmentsList';
import BookAppointment from './pages/Appointments/BookAppointment';
import UserProfile from './pages/Profile/UserProfile';
import UserManagement from './pages/Admin/UserManagement';
import ManageSchedule from './pages/Schedules/ManageSchedule'; // Add this import
import LoadingSpinner from './components/Common/LoadingSpinner';
import ProtectedRoute from './components/Common/ProtectedRoute';
import SchedulesList from './pages/Schedules/SchedulesList';
import theme from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Basic auth check (for general protection)
const AuthProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Protected Routes with Layout */}
                <Route path="/" element={
                  <AuthProtectedRoute>
                    <Layout />
                  </AuthProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Doctors Routes */}
                  <Route path="doctors" element={
                    <ProtectedRoute requiredPermission="view_doctors">
                      <DoctorsList />
                    </ProtectedRoute>
                  } />
                  <Route path="doctors/add" element={
                    <ProtectedRoute requiredPermission="manage_doctors">
                      <AddDoctor />
                    </ProtectedRoute>
                  } />
                  <Route path="doctors/edit/:id" element={
                    <ProtectedRoute requiredPermission="manage_doctors">
                      <EditDoctor />
                    </ProtectedRoute>
                  } />
                  
                  {/* Patients Routes */}
                  <Route path="patients" element={
                    <ProtectedRoute requiredPermission="view_patients">
                      <PatientsList />
                    </ProtectedRoute>
                  } />
                  <Route path="patients/add" element={
                    <ProtectedRoute requiredPermission="manage_patients">
                      <AddPatient />
                    </ProtectedRoute>
                  } />
                  <Route path="patients/edit/:id" element={
                    <ProtectedRoute requiredPermission="manage_patients">
                      <EditPatient />
                    </ProtectedRoute>
                  } />
                  
                  {/* Appointments Routes */}
                  <Route path="appointments" element={
                    <ProtectedRoute requiredPermission="view_appointments">
                      <AppointmentsList />
                    </ProtectedRoute>
                  } />
                  <Route path="appointments/book" element={
                    <ProtectedRoute requiredPermission="book_appointments">
                      <BookAppointment />
                    </ProtectedRoute>
                  } />
                  
                  {/* Schedule Routes */}
                  <Route path="schedules/manage" element={
                    <ProtectedRoute requiredPermission="manage_schedules">
                      <ManageSchedule />
                    </ProtectedRoute>
                  } />
                  // Add these routes
<Route path="/schedules/manage" element={<ManageSchedule />} />
<Route path="/schedules" element={<SchedulesList />} />
                  {/* Admin Routes */}
                  <Route path="admin/users" element={
                    <ProtectedRoute requiredRole="ROLE_ADMIN">
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Profile Routes */}
                  <Route path="profile" element={<UserProfile />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;