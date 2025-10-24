// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { appointmentService } from '../../services/appointmentService';
import { userService } from '../../services/userService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { Box, CircularProgress, Alert,Button } from '@mui/material';

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
      
      // Load all necessary data in parallel
      const [appointments, doctors, patients] = await Promise.all([
        appointmentService.getAll(),
        doctorService.getAll(),
        patientService.getAll()
      ]);
      
      console.log('📊 Dashboard data loaded:', {
        appointments: appointments.length,
        doctors: doctors.length,
        patients: patients.length
      });

      // Load user stats based on role
      let userStats = {};
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        userStats = await loadAdminStats(appointments, doctors, patients);
      } else if (user?.roles?.includes('ROLE_DOCTOR')) {
        userStats = await loadDoctorStats(appointments, doctors, patients);
      } else {
        userStats = await loadPatientStats(appointments, doctors, patients);
      }
      
      setStats(userStats);
      setRecentAppointments(appointments.slice(0, 5)); // Last 5 appointments
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      // ✅ FIXED: Use actual counts from services
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      
      // ✅ FIXED: Calculate appointments properly
      appointmentsToday: appointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      
      monthlyGrowth: calculateMonthlyGrowth(appointments),
      
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => 
        apt.status === 'COMPLETED' || apt.status === 'COMPLETED'
      ).length,
      
      upcomingAppointments: appointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
    };
  };

  const loadDoctorStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ FIXED: Get current doctor's appointments properly
    const doctorAppointments = appointments.filter(apt => {
      // Try different ways to match doctor
      return apt.doctorId === user?.doctorId || 
             apt.doctor?.id === user?.doctorId ||
             apt.doctorName === user?.username ||
             (apt.doctor && apt.doctor.name === user?.username);
    });
    
    console.log('👨‍⚕️ Doctor appointments:', {
      totalAppointments: appointments.length,
      doctorAppointments: doctorAppointments.length,
      doctorId: user?.doctorId,
      username: user?.username
    });
    
    // ✅ FIXED: Get unique patients from doctor's appointments
    const uniquePatientIds = [...new Set(doctorAppointments
      .filter(apt => apt.patientId || apt.patient?.id)
      .map(apt => apt.patientId || apt.patient?.id)
    )];
    
    return {
      todaysAppointments: doctorAppointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      
      upcomingAppointments: doctorAppointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
      
      completedAppointments: doctorAppointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      
      // ✅ FIXED: Use actual unique patient count
      totalPatients: uniquePatientIds.length,
      totalAppointments: doctorAppointments.length,
    };
  };

  const loadPatientStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ FIXED: Get current patient's appointments properly
    const patientAppointments = appointments.filter(apt => {
      // Try different ways to match patient
      return apt.patientId === user?.patientId || 
             apt.patient?.id === user?.patientId ||
             apt.patientName === user?.username ||
             (apt.patient && apt.patient.name === user?.username);
    });
    
    console.log('👤 Patient appointments:', {
      totalAppointments: appointments.length,
      patientAppointments: patientAppointments.length,
      patientId: user?.patientId,
      username: user?.username
    });
    
    return {
      upcomingAppointments: patientAppointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
      
      completedAppointments: patientAppointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      
      todaysAppointments: patientAppointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      
      totalAppointments: patientAppointments.length,
    };
  };

  // ✅ ADDED: Calculate monthly growth (placeholder implementation)
  const calculateMonthlyGrowth = (appointments) => {
    // Simple growth calculation based on last month vs current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.createdAt);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear;
    }).length;
    
    if (lastMonthAppointments === 0) return 100; // 100% growth if no appointments last month
    
    return Math.round(((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100);
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
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Retry
        </Button>
      </Box>
    );
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
        return <Alert severity="error">Unknown user role: {userRole}</Alert>;
    }
  };

  return (
    <Box>
      {renderDashboard()}
    </Box>
  );
};

export default Dashboard;