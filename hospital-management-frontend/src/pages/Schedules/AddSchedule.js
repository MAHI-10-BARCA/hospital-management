import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/scheduleService';
import DoctorProfileSetup from '../Profile/DoctorProfileSetup';
import { useSnackbar } from 'notistack';

const AddSchedule = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [hasDoctorProfile, setHasDoctorProfile] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    availableDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    maxPatients: 1
  });

  // Check if doctor profile exists
  useEffect(() => {
    const checkDoctorProfile = async () => {
      if (user && user.hasRole('DOCTOR')) {
        try {
          const profile = await scheduleService.getMyDoctorProfile();
          setDoctorProfile(profile);
          setHasDoctorProfile(true);
          console.log('✅ Doctor profile found:', profile);
        } catch (error) {
          console.log('⚠️ No doctor profile found, showing setup form');
          setHasDoctorProfile(false);
        }
      }
    };

    checkDoctorProfile();
  }, [user]);

  const handleProfileCreated = (profile) => {
    setHasDoctorProfile(true);
    setDoctorProfile(profile);
    enqueueSnackbar('Doctor profile created successfully!', { variant: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // ✅ FIXED: Use the new createMySchedule method that automatically gets the correct doctor ID
      await scheduleService.createMySchedule(formData);
      
      enqueueSnackbar('Schedule added successfully!', { variant: 'success' });
      setFormData({
        availableDate: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        maxPatients: 1
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      setError('Error adding schedule: ' + (error.message || 'Unknown error'));
      enqueueSnackbar('Error adding schedule: ' + (error.message || 'Unknown error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // If user doesn't have doctor profile, show setup form
  if (user && user.hasRole('DOCTOR') && !hasDoctorProfile) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
        minHeight: '100vh',
        p: 3
      }}>
        <DoctorProfileSetup onProfileCreated={handleProfileCreated} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Card sx={{ maxWidth: 800, mx: 'auto', borderRadius: '20px' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ color: 'text.primary', mb: 4 }}
          >
            Add Schedule
          </Typography>

          {doctorProfile && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
              <Typography variant="body2" fontWeight="bold">
                Creating schedule for: {doctorProfile.name} 
                {doctorProfile.specialization && ` (${doctorProfile.specialization})`}
              </Typography>
              <Typography variant="body2">
                Doctor ID: {doctorProfile.id}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Slot Duration</InputLabel>
                  <Select
                    name="slotDuration"
                    value={formData.slotDuration}
                    onChange={handleChange}
                    label="Slot Duration"
                    sx={{
                      borderRadius: '12px',
                    }}
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Patients per Slot"
                  name="maxPatients"
                  type="number"
                  value={formData.maxPatients}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 10 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Adding Schedule...' : 'Add Schedule'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddSchedule;