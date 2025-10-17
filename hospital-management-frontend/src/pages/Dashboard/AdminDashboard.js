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
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const AdminDashboard = ({ user, stats, recentAppointments, navigate }) => {
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: <PeopleIcon />,
      color: '#1976d2',
      subtitle: 'Registered patients'
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors || 0,
      icon: <DoctorIcon />,
      color: '#2e7d32',
      subtitle: 'Medical staff'
    },
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday || 0,
      icon: <CalendarTodayIcon />,
      color: '#ed6c02',
      subtitle: 'Scheduled for today'
    },
    {
      title: 'Monthly Growth',
      value: stats.monthlyGrowth > 0 ? `+${stats.monthlyGrowth}%` : '0%',
      icon: <TrendingIcon />,
      color: stats.monthlyGrowth > 0 ? '#2e7d32' : '#d32f2f',
      subtitle: 'Patient growth'
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
              Welcome back, {user?.username}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              🏥 Hospital Administration
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage hospital operations and staff
            </Typography>
          </Box>
          <Chip
            label="ADMIN"
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

export default AdminDashboard;