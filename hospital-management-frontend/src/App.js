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
import LoadingSpinner from './components/Common/LoadingSpinner';
import theme from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }) => {
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

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Doctors Routes */}
                  <Route path="doctors" element={<DoctorsList />} />
                  <Route path="doctors/add" element={<AddDoctor />} />
                  <Route path="doctors/edit/:id" element={<EditDoctor />} />
                  
                  {/* Patients Routes */}
                  <Route path="patients" element={<PatientsList />} />
                  <Route path="patients/add" element={<AddPatient />} />
                  <Route path="patients/edit/:id" element={<EditPatient />} />
                  
                  {/* Appointments Routes */}
                  <Route path="appointments" element={<AppointmentsList />} />
                  <Route path="appointments/book" element={<BookAppointment />} />
                  
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