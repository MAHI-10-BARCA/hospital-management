import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const PatientDashboard = ({ user, stats, recentAppointments, navigate }) => {
  const statCards = [
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments || 0,
      icon: <CalendarTodayIcon />,
      color: '#1976d2',
      subtitle: 'Scheduled visits'
    },
    {
      title: 'Completed',
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
      subtitle: 'All time'
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
              Welcome back, {user?.username}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              👤 Patient Portal
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage your healthcare appointments
            </Typography>
          </Box>
          <Chip
            label="PATIENT"
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: 'black', fontWeight: 'bold' }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderLeft: `4px solid ${stat.color}`, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: `${stat.color}20`, borderRadius: 2, p: 1, mr: 2 }}>
                    {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 32 } })}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="body2" color="textSecondary">{stat.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PatientDashboard;