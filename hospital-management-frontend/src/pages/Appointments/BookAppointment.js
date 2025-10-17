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
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { scheduleService } from '../../services/scheduleService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/helpers';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduleId: '',
    reason: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.doctorId) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, scheduleId: '' }));
    }
  }, [formData.doctorId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [doctorsData, patientsData] = await Promise.all([
        doctorService.getAll(),
        patientService.getAll()
      ]);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (err) {
      setError('Failed to load initial data');
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const slots = await scheduleService.getAvailableByDoctor(formData.doctorId);
      setAvailableSlots(slots);
    } catch (err) {
      enqueueSnackbar('Failed to load available slots', { variant: 'error' });
      setAvailableSlots([]);
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
    if (!formData.patientId || !formData.doctorId || !formData.scheduleId || !formData.reason) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const appointmentData = {
        patient: { id: parseInt(formData.patientId) },
        doctor: { id: parseInt(formData.doctorId) },
        schedule: { id: parseInt(formData.scheduleId) },
        reason: formData.reason,
        status: 'SCHEDULED'
      };

      await appointmentService.create(appointmentData);
      enqueueSnackbar('Appointment booked successfully!', { variant: 'success' });
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      enqueueSnackbar('Failed to book appointment', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  const getSelectedDoctor = () => {
    return doctors.find(d => d.id === parseInt(formData.doctorId));
  };

  const getSelectedSlot = () => {
    return availableSlots.find(s => s.id === parseInt(formData.scheduleId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Book New Appointment
      </Typography>

      <Card sx={{ maxWidth: 800, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Patient</InputLabel>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    label="Select Patient"
                    required
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Doctor Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Doctor</InputLabel>
                  <Select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    label="Select Doctor"
                    required
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Available Time Slots */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Available Time Slots</InputLabel>
                  <Select
                    name="scheduleId"
                    value={formData.scheduleId}
                    onChange={handleChange}
                    label="Available Time Slots"
                    required
                    disabled={!formData.doctorId || availableSlots.length === 0}
                  >
                    {availableSlots.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>
                        {formatDate(slot.availableDate)} - {formatTime(slot.startTime)} to {formatTime(slot.endTime)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formData.doctorId && availableSlots.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    No available slots for this doctor
                  </Typography>
                )}
              </Grid>

              {/* Reason for Appointment */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Appointment"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  placeholder="Please describe the reason for your appointment..."
                />
              </Grid>

              {/* Appointment Summary */}
              {(formData.doctorId || formData.scheduleId) && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Appointment Summary
                    </Typography>
                    {getSelectedDoctor() && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Doctor:</strong> Dr. {getSelectedDoctor()?.name} - {getSelectedDoctor()?.specialization}
                      </Typography>
                    )}
                    {getSelectedSlot() && (
                      <Typography variant="body2">
                        <strong>Date & Time:</strong> {formatDate(getSelectedSlot()?.availableDate)} at {formatTime(getSelectedSlot()?.startTime)}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
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

export default BookAppointment;