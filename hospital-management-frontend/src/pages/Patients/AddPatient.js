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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { patientService } from '../../services/patientService';
import { GENDER_OPTIONS } from '../../utils/constants';

const AddPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.age || !formData.gender) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.age < 0 || formData.age > 150) {
      setError('Please enter a valid age (0-150)');
      setLoading(false);
      return;
    }

    try {
      await patientService.create({
        ...formData,
        age: parseInt(formData.age),
      });
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

      <Card sx={{ maxWidth: 600, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Patient Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Enter patient's full name"
            />

            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ min: 0, max: 150 }}
              placeholder="Enter patient's age"
            />

            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Select gender"
            >
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {loading ? 'Adding...' : 'Add Patient'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ borderRadius: 2, px: 4 }}
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