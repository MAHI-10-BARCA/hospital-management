import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

// Import separate dashboard components
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Simple and reliable role detection
  const getUserRole = () => {
    if (!user || !user.roles) {
      return 'PATIENT';
    }

    console.log('🎭 User roles from backend:', user.roles);

    // Check roles in order of priority
    if (user.roles.includes('ROLE_ADMIN')) {
      return 'ADMIN';
    }
    if (user.roles.includes('ROLE_DOCTOR')) {
      return 'DOCTOR';
    }
    if (user.roles.includes('ROLE_PATIENT')) {
      return 'PATIENT';
    }

    // Fallback to patient
    return 'PATIENT';
  };

  const userRole = getUserRole();
  console.log('🎯 Final determined role:', userRole);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let roleSpecificStats = {};
      let roleSpecificAppointments = [];

      switch (userRole) {
        case 'ADMIN':
          console.log('👑 Loading ADMIN dashboard data');
          const [appointments, patients, doctors] = await Promise.all([
            appointmentService.getAll().catch(() => []),
            patientService.getAll().catch(() => []),
            doctorService.getAll().catch(() => [])
          ]);

          roleSpecificStats = {
            totalPatients: patients.length || 0,
            totalDoctors: doctors.length || 0,
            appointmentsToday: appointments.filter(apt => {
              if (apt.date) {
                const appointmentDate = new Date(apt.date);
                const today = new Date();
                return appointmentDate.toDateString() === today.toDateString();
              }
              return false;
            }).length || 0,
            monthlyGrowth: 12,
            totalAppointments: appointments.length || 0,
          };
          roleSpecificAppointments = appointments.slice(0, 5);
          break;

        case 'DOCTOR':
          console.log('🩺 Loading DOCTOR dashboard data for:', user.username);
          try {
            const allAppointments = await appointmentService.getAll().catch(() => []);
            const doctorAppointments = allAppointments.filter(apt => 
              apt.doctor?.username === user.username || 
              apt.doctorName === user.username
            );
            
            roleSpecificStats = {
              todaysAppointments: doctorAppointments.filter(apt => {
                if (apt.date) {
                  const appointmentDate = new Date(apt.date);
                  const today = new Date();
                  return appointmentDate.toDateString() === today.toDateString();
                }
                return false;
              }).length || 0,
              upcomingAppointments: doctorAppointments.filter(apt => {
                if (apt.date) {
                  return new Date(apt.date) > new Date();
                }
                return false;
              }).length || 0,
              completedAppointments: doctorAppointments.filter(apt => 
                apt.status === 'COMPLETED' || apt.status === 'completed'
              ).length || 0,
              totalPatients: new Set(doctorAppointments.map(apt => apt.patient?.id)).size || 0,
              totalAppointments: doctorAppointments.length || 0,
            };
            roleSpecificAppointments = doctorAppointments.slice(0, 5);
          } catch (error) {
            console.error('Error loading doctor data:', error);
            roleSpecificStats = {
              todaysAppointments: 0,
              upcomingAppointments: 0,
              completedAppointments: 0,
              totalPatients: 0,
              totalAppointments: 0,
            };
          }
          break;

        case 'PATIENT':
        default:
          console.log('👤 Loading PATIENT dashboard data for:', user.username);
          try {
            const allAppointments = await appointmentService.getAll().catch(() => []);
            const patientAppointments = allAppointments.filter(apt => 
              apt.patient?.username === user.username || 
              apt.patientName === user.username
            );
            
            roleSpecificStats = {
              upcomingAppointments: patientAppointments.filter(apt => {
                if (apt.date) {
                  return new Date(apt.date) > new Date();
                }
                return false;
              }).length || 0,
              completedAppointments: patientAppointments.filter(apt => 
                apt.status === 'COMPLETED' || apt.status === 'completed'
              ).length || 0,
              todaysAppointments: patientAppointments.filter(apt => {
                if (apt.date) {
                  const appointmentDate = new Date(apt.date);
                  const today = new Date();
                  return appointmentDate.toDateString() === today.toDateString();
                }
                return false;
              }).length || 0,
              totalAppointments: patientAppointments.length || 0,
            };
            roleSpecificAppointments = patientAppointments.slice(0, 5);
          } catch (error) {
            console.error('Error loading patient data:', error);
            roleSpecificStats = {
              upcomingAppointments: 0,
              completedAppointments: 0,
              todaysAppointments: 0,
              totalAppointments: 0,
            };
          }
          break;
      }
      
      setStats(roleSpecificStats);
      setRecentAppointments(roleSpecificAppointments);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  console.log('🎨 Rendering dashboard for role:', userRole);

  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard user={user} stats={stats} recentAppointments={recentAppointments} navigate={navigate} />;
    case 'DOCTOR':
      return <DoctorDashboard user={user} stats={stats} recentAppointments={recentAppointments} navigate={navigate} />;
    case 'PATIENT':
    default:
      return <PatientDashboard user={user} stats={stats} recentAppointments={recentAppointments} navigate={navigate} />;
  }
};

export default Dashboard;