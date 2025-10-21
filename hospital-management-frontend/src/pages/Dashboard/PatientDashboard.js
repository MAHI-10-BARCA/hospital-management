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
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = ({ user, stats, recentAppointments }) => {
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments || 0,
      icon: <CalendarTodayIcon />,
      color: '#6366f1',
      subtitle: 'Scheduled visits',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      action: () => navigate('/appointments')
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments || 0,
      icon: <AssignmentIcon />,
      color: '#10b981',
      subtitle: 'Past appointments',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments || 0,
      icon: <ScheduleIcon />,
      color: '#f59e0b',
      subtitle: 'Scheduled for today',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      title: 'Total Visits',
      value: stats.totalAppointments || 0,
      icon: <PeopleIcon />,
      color: '#8b5cf6',
      subtitle: 'All time visits',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  ];

  const quickActions = [
    {
      title: 'Book Appointment',
      icon: <AddIcon />,
      path: '/appointments/book',
      color: '#6366f1',
      description: 'Schedule new appointment'
    },
    {
      title: 'View Appointments',
      icon: <CalendarTodayIcon />,
      path: '/appointments',
      color: '#10b981',
      description: 'Check your appointments'
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Glass Effect */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
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
            background: 'linear-gradient(90deg, #8b5cf6, #7c3aed, #8b5cf6)',
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
              Welcome back, {user?.username}! 👤
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 500 }}>
              Patient Healthcare Portal
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              Manage your healthcare appointments and medical care
            </Typography>
          </Box>
          <Chip
            label="PATIENT"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
            <Grid item xs={12} sm={6} key={index}>
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
    </Box>
  );
};

export default PatientDashboard;