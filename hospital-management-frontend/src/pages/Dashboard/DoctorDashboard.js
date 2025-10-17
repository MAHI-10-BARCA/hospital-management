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

const DoctorDashboard = ({ user, stats, recentAppointments, navigate }) => {
  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments || 0,
      icon: <ScheduleIcon />,
      color: '#1976d2',
      subtitle: 'Your schedule'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingAppointments || 0,
      icon: <CalendarTodayIcon />,
      color: '#ed6c02',
      subtitle: 'Future appointments'
    },
    {
      title: 'Completed',
      value: stats.completedAppointments || 0,
      icon: <AssignmentIcon />,
      color: '#2e7d32',
      subtitle: 'This month'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#9c27b0',
      subtitle: 'Under your care'
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
              Welcome back, Dr. {user?.username}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              👨‍⚕️ Doctor's Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage your patients and schedule
            </Typography>
          </Box>
          <Chip
            label="DOCTOR"
            size="small"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
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

export default DoctorDashboard;