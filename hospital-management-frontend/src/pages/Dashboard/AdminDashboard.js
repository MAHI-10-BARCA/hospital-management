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
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, stats, recentAppointments }) => {
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#1976d2',
      subtitle: 'Registered patients',
      action: () => navigate('/patients')
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors || 0,
      icon: <DoctorIcon />,
      color: '#2e7d32',
      subtitle: 'Medical staff',
      action: () => navigate('/doctors')
    },
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday || 0,
      icon: <CalendarTodayIcon />,
      color: '#ed6c02',
      subtitle: 'Scheduled for today',
      action: () => navigate('/appointments')
    },
    {
      title: 'Monthly Growth',
      value: stats.monthlyGrowth > 0 ? `+${stats.monthlyGrowth}%` : '0%',
      icon: <TrendingIcon />,
      color: stats.monthlyGrowth > 0 ? '#2e7d32' : '#d32f2f',
      subtitle: 'Patient growth'
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      icon: <AdminIcon />,
      path: '/admin/users',
      color: '#9c27b0'
    },
    {
      title: 'Add Doctor',
      icon: <AddIcon />,
      path: '/doctors/add',
      color: '#2e7d32'
    },
    {
      title: 'Add Patient',
      icon: <AddIcon />,
      path: '/patients/add',
      color: '#1976d2'
    },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome back, {user?.username}! 👑
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              🏥 Hospital Administration Panel
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Complete system oversight and management
            </Typography>
          </Box>
          <Chip
            label="ADMINISTRATOR"
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

export default AdminDashboard;