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
import { patientService } from '../../services/patientService';
import { GENDER_OPTIONS } from '../../utils/constants';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditPatient = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const patient = await patientService.getById(id);
      setFormData({
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || '',
      });
    } catch (err) {
      setError('Failed to load patient details');
      enqueueSnackbar('Failed to load patient details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
    setSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.age || !formData.gender) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (formData.age < 0 || formData.age > 150) {
      setError('Please enter a valid age (0-150)');
      setSubmitting(false);
      return;
    }

    try {
      await patientService.update(id, {
        ...formData,
        age: parseInt(formData.age),
      });
      enqueueSnackbar('Patient updated successfully!', { variant: 'success' });
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient');
      enqueueSnackbar('Failed to update patient', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Edit Patient
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
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {submitting ? 'Updating...' : 'Update Patient'}
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

export default EditPatient;