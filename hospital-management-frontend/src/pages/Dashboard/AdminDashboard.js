// src/pages/Dashboard/AdminDashboard.js
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Button,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, stats, recentAppointments }) => {
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#6366f1',
      subtitle: 'Registered patients',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      action: () => navigate('/patients')
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors || 0,
      icon: <DoctorIcon />,
      color: '#10b981',
      subtitle: 'Medical staff',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      action: () => navigate('/doctors')
    },
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday || 0,
      icon: <CalendarTodayIcon />,
      color: '#f59e0b',
      subtitle: 'Scheduled for today',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      action: () => navigate('/appointments')
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments || 0,
      icon: <TrendingIcon />,
      color: stats.monthlyGrowth > 0 ? '#10b981' : '#ef4444',
      subtitle: 'All appointments',
      gradient: stats.monthlyGrowth > 0 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  ];

  const quickActions = [
    {
      title: 'View All Appointments',
      icon: <VisibilityIcon />,
      path: '/appointments',
      color: '#6366f1',
      description: 'See all appointments across system'
    },
    {
      title: 'Manage Doctors',
      icon: <DoctorIcon />,
      path: '/doctors',
      color: '#10b981',
      description: 'Doctor management'
    },
    {
      title: 'Patient Records',
      icon: <PeopleIcon />,
      path: '/patients',
      color: '#8b5cf6',
      description: 'Patient database'
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Glass Effect */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Welcome back, {user?.username}! 👑
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 500 }}>
              🏥 Hospital Administration Panel
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              Complete system oversight and management
            </Typography>
          </Box>
          <Chip
            label="ADMINISTRATOR"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>
      </Paper>

      {/* Statistics Cards with Glass Morphism */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                cursor: stat.action ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: stat.gradient,
                },
                '&:hover': stat.action ? {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.15)',
                } : {}
              }}
              onClick={stat.action}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    background: stat.gradient,
                    borderRadius: '14px', 
                    p: 1.5, 
                    mr: 2,
                    boxShadow: `0 4px 14px 0 ${alpha(stat.color, 0.3)}`,
                  }}>
                    {React.cloneElement(stat.icon, { 
                      sx: { color: 'white', fontSize: 24 } 
                    })}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold"
                      sx={{
                        background: stat.gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="#64748b" fontWeight="500">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="#94a3b8" fontWeight="500">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions with Neumorphic Design */}
      <Paper sx={{ 
        p: 4, 
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        boxShadow: `
          0 8px 32px 0 rgba(31, 38, 135, 0.07),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.5)
        `,
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 3,
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  justifyContent: 'flex-start',
                  p: 3,
                  border: `2px solid ${action.color}20`,
                  color: action.color,
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  fontWeight: 600,
                  textAlign: 'left',
                  height: 'auto',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `2px solid ${action.color}40`,
                    background: `${action.color}08`,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px 0 ${alpha(action.color, 0.15)}`,
                  }
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="600">
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="#64748b" sx={{ mt: 0.5, display: 'block' }}>
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>


{/* Recent Activity Section */}
{recentAppointments.length > 0 && (
  <Paper sx={{ 
    p: 4, 
    mt: 4,
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
  }}>
    <Typography 
      variant="h5" 
      gutterBottom 
      fontWeight="bold"
      sx={{
        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
    >
      Recent Appointments
    </Typography>
    <Box sx={{ mt: 2 }}>
      {recentAppointments.map((appointment, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 1,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography fontWeight="500">
              {/* ✅ FIXED: Handle different appointment data structures */}
              {appointment.patientName || appointment.patient?.name || 'Patient'} 
              {' with Dr. '} 
              {appointment.doctorName || appointment.doctor?.name || 'Doctor'}
            </Typography>
            <Typography variant="body2" color="#64748b">
              {appointment.appointmentDate || appointment.availableDate} • {appointment.status}
            </Typography>
          </Box>
          <Chip
            label={appointment.status}
            size="small"
            sx={{
              background: appointment.status === 'COMPLETED' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : appointment.status === 'SCHEDULED' || appointment.status === 'PENDING'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontWeight: '600',
            }}
          />
        </Box>
      ))}
    </Box>
  </Paper>
)}
      
    </Box>
  );
};

export default AdminDashboard;