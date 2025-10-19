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
      color: '#1976d2',
      subtitle: 'Scheduled visits',
      action: () => navigate('/appointments')
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments || 0,
      icon: <AssignmentIcon />,
      color: '#2e7d32',
      subtitle: 'Past appointments'
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments || 0,
      icon: <ScheduleIcon />,
      color: '#ed6c02',
      subtitle: 'Scheduled for today'
    },
    {
      title: 'Total Visits',
      value: stats.totalAppointments || 0,
      icon: <PeopleIcon />,
      color: '#9c27b0',
      subtitle: 'All time visits'
    },
  ];

  const quickActions = [
    {
      title: 'Book Appointment',
      icon: <AddIcon />,
      path: '/appointments/book',
      color: '#1976d2'
    },
    {
      title: 'View Appointments',
      icon: <CalendarTodayIcon />,
      path: '/appointments',
      color: '#2e7d32'
    },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          color: 'black',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome back, {user?.username}! 👤
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              Patient Healthcare Portal
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage your healthcare appointments and medical care
            </Typography>
          </Box>
          <Chip
            label="PATIENT"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              color: 'black', 
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
            <Grid item xs={12} sm={6} key={index}>
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

export default PatientDashboard;