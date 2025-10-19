import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Grid,
  Paper,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { doctorService } from '../../services/doctorService';
import { SPECIALIZATIONS } from '../../utils/helpers';

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
    email: '',
    phone: '',
    experience: '',
    qualifications: '',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Doctor name is required');
      return false;
    }
    if (!formData.specialization) {
      setError('Specialization is required');
      return false;
    }
    if (!formData.contact.trim()) {
      setError('Contact information is required');
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const doctorData = {
        name: formData.name.trim(),
        specialization: formData.specialization,
        contact: formData.contact.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        qualifications: formData.qualifications.trim() || null,
        isAvailable: formData.isAvailable,
      };

      await doctorService.create(doctorData);
      enqueueSnackbar('Doctor added successfully!', { variant: 'success' });
      navigate('/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
      enqueueSnackbar('Failed to add doctor', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/doctors');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Add New Doctor
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Doctor Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doctor Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter doctor's full name"
                  helperText="Full name as it should appear in records"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Specialization *"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  placeholder="Select specialization"
                >
                  {SPECIALIZATIONS.map((specialization) => (
                    <MenuItem key={specialization} value={specialization}>
                      {specialization}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <PhoneIcon /> Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Contact *"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="Phone number or email"
                  helperText="Primary contact method for the doctor"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  helperText="Professional email address"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  helperText="Format: 1234567890"
                />
              </Grid>

              {/* Professional Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <WorkIcon /> Professional Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  inputProps={{ min: 0, max: 50 }}
                  helperText="Number of years in practice"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualifications & Certifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="e.g., MBBS, MD, Board Certified..."
                  helperText="List degrees, certifications, and special qualifications"
                />
              </Grid>

              {/* Availability */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      name="isAvailable"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        Available for Appointments
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Doctor will appear in available doctors list
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 2, px: 4 }}
                size="large"
              >
                {loading ? 'Adding Doctor...' : 'Add Doctor'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ borderRadius: 2, px: 4 }}
                size="large"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddDoctor;