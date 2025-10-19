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
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as AddressIcon,
  Favorite as HealthIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { patientService } from '../../services/patientService';
import { GENDER_OPTIONS } from '../../utils/helpers';

// Define blood groups here (remove the duplicate at the bottom)
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddPatient = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    age: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    
    // Contact Information
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Medical Information
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    insuranceProvider: '',
    insuranceId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateOfBirthChange = (e) => {
    const dateString = e.target.value;
    setFormData({
      ...formData,
      dateOfBirth: dateString,
      age: dateString ? calculateAge(dateString).toString() : ''
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Patient name is required');
      return false;
    }
    if (!formData.age || formData.age < 0 || formData.age > 150) {
      setError('Please enter a valid age (0-150)');
      return false;
    }
    if (!formData.gender) {
      setError('Gender is required');
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
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
      const patientData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        bloodGroup: formData.bloodGroup || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        emergencyContact: formData.emergencyContact.trim() || null,
        emergencyPhone: formData.emergencyPhone.trim() || null,
        medicalHistory: formData.medicalHistory.trim() || null,
        allergies: formData.allergies.trim() || null,
        currentMedications: formData.currentMedications.trim() || null,
        insuranceProvider: formData.insuranceProvider.trim() || null,
        insuranceId: formData.insuranceId.trim() || null,
      };

      await patientService.create(patientData);
      enqueueSnackbar('Patient added successfully!', { variant: 'success' });
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
      enqueueSnackbar('Failed to add patient', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Add New Patient
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonIcon /> Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient's full name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender *"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="Age will be calculated automatically"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age *"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, max: 150 }}
                  helperText="Calculated from date of birth"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  {BLOOD_GROUPS.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Contact Information */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PhoneIcon /> Contact Information
            </Typography>

            <Grid container spacing={3}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Full residential address"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact person"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Emergency contact number"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Medical Information */}
            <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HealthIcon /> Medical Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical History"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Previous medical conditions, surgeries, chronic illnesses..."
                  helperText="List any significant medical history"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Drug allergies, food allergies, environmental allergies..."
                  helperText="Known allergies and reactions"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Medications"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Prescription drugs, over-the-counter medications..."
                  helperText="Current medications and dosages"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  placeholder="Insurance company name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance ID"
                  name="insuranceId"
                  value={formData.insuranceId}
                  onChange={handleChange}
                  placeholder="Insurance policy number"
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
                {loading ? 'Adding Patient...' : 'Add Patient'}
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

export default AddPatient;