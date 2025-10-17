import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { doctorService } from '../../services/doctorService';
import { SPECIALIZATIONS } from '../../utils/constants';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditDoctor = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadDoctor();
  }, [id]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const doctor = await doctorService.getById(id);
      setFormData({
        name: doctor.name || '',
        specialization: doctor.specialization || '',
        contact: doctor.contact || '',
      });
    } catch (err) {
      setError('Failed to load doctor details');
      enqueueSnackbar('Failed to load doctor details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.specialization || !formData.contact) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      await doctorService.update(id, formData);
      enqueueSnackbar('Doctor updated successfully!', { variant: 'success' });
      navigate('/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor');
      enqueueSnackbar('Failed to update doctor', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/doctors');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Edit Doctor
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
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {submitting ? 'Updating...' : 'Update Doctor'}
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

export default EditDoctor;