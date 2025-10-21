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
  alpha,
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
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Edit Doctor
      </Typography>

      <Card 
        sx={{ 
          maxWidth: 600, 
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ 
                  borderRadius: '12px', 
                  px: 4,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0da271 0%, #047852 100%)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {submitting ? 'Updating...' : 'Update Doctor'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ 
                  borderRadius: '12px', 
                  px: 4,
                  border: '2px solid rgba(99, 102, 241, 0.2)',
                  color: '#6366f1',
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    border: '2px solid rgba(99, 102, 241, 0.4)',
                    background: 'rgba(99, 102, 241, 0.08)',
                  },
                  transition: 'all 0.3s ease',
                }}
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