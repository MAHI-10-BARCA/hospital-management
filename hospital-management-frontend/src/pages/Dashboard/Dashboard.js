// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import { Box, CircularProgress, Alert } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load appointments
      const appointments = await appointmentService.getAll();
      
      // Load user stats based on role
      let userStats = {};
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        userStats = await loadAdminStats(appointments);
      } else if (user?.roles?.includes('ROLE_DOCTOR')) {
        userStats = await loadDoctorStats(appointments);
      } else {
        userStats = await loadPatientStats(appointments);
      }
      
      setStats(userStats);
      setRecentAppointments(appointments.slice(0, 5)); // Last 5 appointments
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = (appointments) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalPatients: appointments.reduce((acc, apt) => {
        if (!acc.includes(apt.patientId)) acc.push(apt.patientId);
        return acc;
      }, []).length,
      
      totalDoctors: appointments.reduce((acc, apt) => {
        if (!acc.includes(apt.doctorId)) acc.push(apt.doctorId);
        return acc;
      }, []).length,
      
      appointmentsToday: appointments.filter(apt => 
        apt.appointmentDate === today
      ).length,
      
      monthlyGrowth: 12, // Placeholder - you can calculate this
      
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'COMPLETED').length,
      upcomingAppointments: appointments.filter(apt => apt.status === 'SCHEDULED').length,
    };
  };

  const loadDoctorStats = (appointments) => {
    const today = new Date().toISOString().split('T')[0];
    const doctorAppointments = appointments.filter(apt => 
      apt.doctorId === user?.doctorId || apt.doctorName === user?.username
    );
    
    return {
      todaysAppointments: doctorAppointments.filter(apt => 
        apt.appointmentDate === today
      ).length,
      
      upcomingAppointments: doctorAppointments.filter(apt => 
        apt.status === 'SCHEDULED'
      ).length,
      
      completedAppointments: doctorAppointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      
      totalPatients: [...new Set(doctorAppointments.map(apt => apt.patientId))].length,
      totalAppointments: doctorAppointments.length,
    };
  };

  const loadPatientStats = (appointments) => {
    const today = new Date().toISOString().split('T')[0];
    const patientAppointments = appointments.filter(apt => 
      apt.patientId === user?.patientId || apt.patientName === user?.username
    );
    
    return {
      upcomingAppointments: patientAppointments.filter(apt => 
        apt.status === 'SCHEDULED'
      ).length,
      
      completedAppointments: patientAppointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      
      todaysAppointments: patientAppointments.filter(apt => 
        apt.appointmentDate === today
      ).length,
      
      totalAppointments: patientAppointments.length,
    };
  };

  const getUserRole = () => {
    if (!user || !user.roles) return 'PATIENT';
    if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user.roles.includes('ROLE_DOCTOR')) return 'DOCTOR';
    return 'PATIENT';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const userRole = getUserRole();

  const renderDashboard = () => {
    switch (userRole) {
      case 'ADMIN':
        return <AdminDashboard user={user} stats={stats} recentAppointments={recentAppointments} />;
      case 'DOCTOR':
        return <DoctorDashboard user={user} stats={stats} recentAppointments={recentAppointments} />;
      case 'PATIENT':
        return <PatientDashboard user={user} stats={stats} recentAppointments={recentAppointments} />;
      default:
        return <Alert severity="error">Unknown user role</Alert>;
    }
  };

  return <Box>{renderDashboard()}</Box>;
};

export default Dashboard;