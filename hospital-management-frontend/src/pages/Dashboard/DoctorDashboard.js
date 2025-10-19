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
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  LocalHospital as MedicalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = ({ user, stats, recentAppointments }) => {
  const navigate = useNavigate();

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments || 0,
      icon: <ScheduleIcon />,
      color: '#1976d2',
      subtitle: 'Your schedule today',
      action: () => navigate('/appointments')
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments || 0,
      icon: <CalendarTodayIcon />,
      color: '#ed6c02',
      subtitle: 'Future appointments'
    },
    {
      title: 'Completed This Month',
      value: stats.completedAppointments || 0,
      icon: <AssignmentIcon />,
      color: '#2e7d32',
      subtitle: 'Successful consultations'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#9c27b0',
      subtitle: 'Under your care'
    },
  ];

  const quickActions = [
    {
      title: 'View Schedule',
      icon: <CalendarTodayIcon />,
      path: '/appointments',
      color: '#1976d2'
    },
    {
      title: 'Manage Schedule',
      icon: <ScheduleIcon />,
      path: '/schedules/manage',
      color: '#2e7d32'
    },
    {
      title: 'Patient Records',
      icon: <MedicalIcon />,
      path: '/patients',
      color: '#ed6c02'
    },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome back, Dr. {user?.username}! 🩺
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              Medical Professional Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage your patients and medical practice
            </Typography>
          </Box>
          <Chip
            label="MEDICAL DOCTOR"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                borderLeft: `4px solid ${stat.color}`, 
                height: '100%',
                cursor: stat.action ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': stat.action ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                } : {}
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    backgroundColor: `${stat.color}20`, 
                    borderRadius: 2, 
                    p: 1, 
                    mr: 2 
                  }}>
                    {React.cloneElement(stat.icon, { 
                      sx: { color: stat.color, fontSize: 32 } 
                    })}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: `${action.color}10`,
                  }
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DoctorDashboard;