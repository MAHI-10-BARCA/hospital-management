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
import { Box, CircularProgress, Alert, Button } from '@mui/material';

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
      
      // ✅ FIXED: Load role-specific data
      let appointments = [];
      let doctors = [];
      let patients = [];
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        // Admin sees all data
        [appointments, doctors, patients] = await Promise.all([
          appointmentService.getAll(),
          doctorService.getAll(),
          patientService.getAll()
        ]);
      } else if (user?.roles?.includes('ROLE_DOCTOR')) {
        // Doctor sees only their data
        const doctorProfile = await doctorService.getMyDoctorProfile();
        appointments = await appointmentService.getByDoctor(doctorProfile.id);
        patients = await getDoctorPatients(doctorProfile.id); // ✅ NEW: Get doctor's patients
        doctors = [doctorProfile]; // Doctor only sees themselves
      } else if (user?.roles?.includes('ROLE_PATIENT')) {
        // Patient sees only their data
        const patientProfile = await patientService.getMyPatientProfile();
        appointments = await appointmentService.getByPatient(patientProfile.id);
        doctors = await doctorService.getAll(); // Patients can see all doctors
        patients = [patientProfile]; // Patient only sees themselves
      } else {
        // Default fallback
        appointments = await appointmentService.getAll();
        doctors = await doctorService.getAll();
        patients = await patientService.getAll();
      }
      
      console.log('📊 Dashboard data loaded:', {
        appointments: appointments.length,
        doctors: doctors.length,
        patients: patients.length,
        userRole: user?.roles?.[0]
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

  // ✅ ADDED: Get doctor's patients
  const getDoctorPatients = async (doctorId) => {
    try {
      // Get appointments for this doctor to find their patients
      const appointments = await appointmentService.getByDoctor(doctorId);
      
      // Extract unique patients from appointments
      const uniquePatients = [];
      const patientIds = new Set();
      
      appointments.forEach(apt => {
        if (apt.patientId && !patientIds.has(apt.patientId)) {
          patientIds.add(apt.patientId);
          uniquePatients.push({
            id: apt.patientId,
            name: apt.patientName || 'Unknown Patient'
          });
        }
      });
      
      console.log(`👨‍⚕️ Doctor ${doctorId} has ${uniquePatients.length} unique patients`);
      return uniquePatients;
    } catch (error) {
      console.error('Error getting doctor patients:', error);
      return [];
    }
  };

  const loadAdminStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      appointmentsToday: appointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      monthlyGrowth: calculateMonthlyGrowth(appointments),
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      upcomingAppointments: appointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
    };
  };

  const loadDoctorStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('👨‍⚕️ Doctor stats calculation:', {
      totalAppointments: appointments.length,
      totalPatients: patients.length,
      today: today
    });
    
    return {
      todaysAppointments: appointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      upcomingAppointments: appointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
      completedAppointments: appointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
    };
  };

  const loadPatientStats = (appointments, doctors, patients) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      upcomingAppointments: appointments.filter(apt => 
        apt.status === 'SCHEDULED' || apt.status === 'PENDING'
      ).length,
      completedAppointments: appointments.filter(apt => 
        apt.status === 'COMPLETED'
      ).length,
      todaysAppointments: appointments.filter(apt => {
        const appointmentDate = apt.appointmentDate || apt.availableDate;
        return appointmentDate === today;
      }).length,
      totalAppointments: appointments.length,
    };
  };

  const calculateMonthlyGrowth = (appointments) => {
    // Simple growth calculation
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
    
    if (lastMonthAppointments === 0) return 100;
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