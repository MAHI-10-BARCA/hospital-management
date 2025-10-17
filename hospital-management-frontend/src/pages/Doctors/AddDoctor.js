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
import { doctorService } from '../../services/doctorService';
import { SPECIALIZATIONS } from '../../utils/constants';

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.specialization || !formData.contact) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await doctorService.create(formData);
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
              label="Doctor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Enter doctor's full name"
            />

            <TextField
              fullWidth
              select
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Select specialization"
            >
              {SPECIALIZATIONS.map((specialization) => (
                <MenuItem key={specialization} value={specialization}>
                  {specialization}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Contact Information"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Phone number or email"
              helperText="Provide phone number or email address"
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {loading ? 'Adding...' : 'Add Doctor'}
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

export default AddDoctor;