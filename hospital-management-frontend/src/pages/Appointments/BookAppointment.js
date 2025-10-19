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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Description as ReasonIcon,
  CheckCircle as ConfirmIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { scheduleService } from '../../services/scheduleService';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, canBookAppointments } from '../../utils/helpers';
import PatientProfileSetup from '../Profile/PatientProfileSetup';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';

const steps = ['Choose Doctor', 'Pick Time Slot', 'Confirm Details'];

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduleId: '',
    reason: '',
    urgency: 'ROUTINE',
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasPatientProfile, setHasPatientProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, hasRole } = useAuth(); // ✅ FIXED: Get hasRole from useAuth

  // Check if user can book appointments
  useEffect(() => {
    if (user && !canBookAppointments(user)) {
      navigate('/appointments', { 
        state: { 
          error: 'Admins cannot book appointments. Please use a patient or doctor account.' 
        } 
      });
    }
  }, [user, navigate]);

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

  // Load initial data including patient profile check
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setCheckingProfile(true);
      
      // Load doctors
      const doctorsData = await doctorService.getAll();
      setDoctors(doctorsData);

      // ✅ FIXED: Use hasRole function instead of user.hasRole
      if (user && hasRole('PATIENT')) {
        try {
          await patientService.getMyPatientProfile();
          setHasPatientProfile(true);
        } catch (error) {
          console.log('Patient profile not found:', error.message);
          setHasPatientProfile(false);
        }
      } else {
        // For non-patient users (like ADMIN), skip profile check
        setHasPatientProfile(true);
      }

      // Load patients for ADMIN users
      if (hasPermission(user, 'manage_patients')) {
        const patientsData = await patientService.getAll();
        setPatients(patientsData);
      } else {
        // For patients, they can only book for themselves
        setPatients([{ id: 'self', name: user?.username || 'Current User', age: 'N/A', gender: 'N/A' }]);
        setFormData(prev => ({ ...prev, patientId: 'self' }));
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
      setCheckingProfile(false);
    }
  };

  // Load available time slots for selected doctor
  const loadAvailableSlots = async () => {
    try {
      console.log('🔄 Loading available slots for doctor:', formData.doctorId);
      const slots = await scheduleService.getAvailableByDoctor(formData.doctorId);
      console.log('✅ Available slots loaded:', slots);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('❌ Error loading available slots:', err);
      enqueueSnackbar('Failed to load available slots', { variant: 'error' });
      setAvailableSlots([]);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  // Handle next step in stepper
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !formData.doctorId) {
      setError('Please select a doctor');
      return;
    }
    if (activeStep === 1 && !formData.scheduleId) {
      setError('Please select a time slot');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  // Handle back step in stepper
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  // Handle form submission

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  if (!formData.reason.trim()) {
    setError('Please provide a reason for the appointment');
    setSubmitting(false);
    return;
  }

  try {
    console.log('📅 Creating appointment with data:', formData);
    
    let patientId;
    
    if (hasPermission(user, 'manage_patients')) {
      patientId = formData.patientId === 'self' ? null : parseInt(formData.patientId);
    } else {
      try {
        const patientProfile = await patientService.getMyPatientProfile();
        patientId = patientProfile.id;
        console.log('✅ Using patient profile ID:', patientId);
      } catch (error) {
        console.error('❌ Error getting patient profile:', error);
        setError('Please complete your patient profile first');
        setSubmitting(false);
        return;
      }
    }

    if (!patientId) {
      setError('Patient information is required');
      setSubmitting(false);
      return;
    }

    // ✅ FIXED: Include reason in appointment data
    const appointmentData = {
      patient: { id: patientId },
      doctor: { id: parseInt(formData.doctorId) },
      schedule: { id: parseInt(formData.scheduleId) },
      status: 'SCHEDULED',
      reason: formData.reason // ✅ ADDED
    };

    console.log('📤 Sending appointment request:', appointmentData);
    
    await appointmentService.create(appointmentData);
    enqueueSnackbar('Appointment booked successfully!', { variant: 'success' });
    navigate('/appointments');
  } catch (err) {
    console.error('❌ Error booking appointment:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to book appointment';
    setError(errorMessage);
    enqueueSnackbar('Failed to book appointment: ' + errorMessage, { variant: 'error' });
  } finally {
    setSubmitting(false);
  }
};

  // Handle cancel action
  const handleCancel = () => {
    navigate('/appointments');
  };

  // Handle patient profile creation
  const handleProfileCreated = (profile) => {
    setHasPatientProfile(true);
    // Reload data after profile creation
    loadInitialData();
  };

  // Helper functions to get selected data
  const getSelectedPatient = () => {
    if (formData.patientId === 'self') {
      return { name: user?.username || 'Current User', age: 'N/A', gender: 'N/A' };
    }
    return patients.find(p => p.id === parseInt(formData.patientId));
  };
  
  const getSelectedDoctor = () => doctors.find(d => d.id === parseInt(formData.doctorId));
  const getSelectedSlot = () => availableSlots.find(s => s.id === parseInt(formData.scheduleId));

  // ✅ FIXED: Use hasRole function instead of user.hasRole
  if (user && hasRole('PATIENT') && !hasPatientProfile && !checkingProfile) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Book New Appointment
        </Typography>
        <PatientProfileSetup onProfileCreated={handleProfileCreated} />
      </Box>
    );
  }

  // Render step content based on current step
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* Patient Selection - Only show for ADMIN users */}
            {hasPermission(user, 'manage_patients') && (
              <>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon /> Select Patient
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Patient *</InputLabel>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    label="Select Patient *"
                    required
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Age: {patient.age} • Gender: {patient.gender}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Doctor Selection */}
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <DoctorIcon /> Choose Doctor
</Typography>
<FormControl fullWidth>
  <InputLabel>Select Doctor *</InputLabel>
  <Select
    name="doctorId"
    value={formData.doctorId}
    onChange={handleChange}
    label="Select Doctor *"
    required
  >
    {doctors.map((doctor) => (
      <MenuItem key={doctor.id} value={doctor.userId || doctor.id}> {/* ✅ FIXED: Use userId */}
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Dr. {doctor.name || 'Unnamed Doctor'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {doctor.specialization || 'General'} • Contact: {doctor.contact || 'Not provided'}
            {doctor.userId && ` • User ID: ${doctor.userId}`} {/* Debug info */}
          </Typography>
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>            
            {getSelectedDoctor() && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: 'primary.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Selected Doctor:
                </Typography>
                <Typography variant="body2">
                  Dr. {getSelectedDoctor().name || 'Unnamed Doctor'} - {getSelectedDoctor().specialization || 'General'}
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon /> Pick Time Slot
            </Typography>
            
            {availableSlots.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" fontWeight="bold">
                  No Available Time Slots
                </Typography>
                <Typography variant="body2">
                  {getSelectedDoctor()?.name ? `Dr. ${getSelectedDoctor().name}` : 'This doctor'} hasn't set up their availability schedule yet.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please contact the hospital administration or choose another doctor.
                </Typography>
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Available Time Slots *</InputLabel>
                <Select
                  name="scheduleId"
                  value={formData.scheduleId}
                  onChange={handleChange}
                  label="Available Time Slots *"
                  required
                >
                  {availableSlots.map((slot) => (
                    <MenuItem key={slot.id} value={slot.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {formatDate(slot.availableDate)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Typography>
                        <Typography variant="caption" display="block" color="success.main">
                          {slot.slotDuration}min slots • Max {slot.maxPatients} patient(s)
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {getSelectedSlot() && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: 'success.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Selected Time Slot:
                </Typography>
                <Typography variant="body2">
                  {formatDate(getSelectedSlot().availableDate)} at {formatTime(getSelectedSlot().startTime)}
                </Typography>
                <Typography variant="caption" display="block">
                  Duration: {getSelectedSlot().slotDuration} minutes
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConfirmIcon /> Confirm Appointment Details
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Patient</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getSelectedPatient()?.name || user?.username || 'Current User'}
                  </Typography>
                  {hasPermission(user, 'manage_patients') && getSelectedPatient()?.age !== 'N/A' && (
                    <Typography variant="caption">
                      Age: {getSelectedPatient()?.age} • Gender: {getSelectedPatient()?.gender}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Doctor</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Dr. {getSelectedDoctor()?.name || 'Unnamed Doctor'}
                  </Typography>
                  <Typography variant="caption">
                    {getSelectedDoctor()?.specialization || 'General'}
                  </Typography>
                </Grid>
                
                {getSelectedSlot() && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDate(getSelectedSlot()?.availableDate)}
                      </Typography>
                      <Typography variant="caption">
                        {formatTime(getSelectedSlot()?.startTime)} - {formatTime(getSelectedSlot()?.endTime)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Slot Details</Typography>
                      <Typography variant="body2">
                        {getSelectedSlot()?.slotDuration} minute slots
                      </Typography>
                      <Typography variant="caption">
                        Max {getSelectedSlot()?.maxPatients} patient(s) per slot
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Urgency</Typography>
                  <Chip 
                    label={formData.urgency} 
                    size="small" 
                    color={formData.urgency === 'URGENT' ? 'error' : 'primary'}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
              <ReasonIcon /> Appointment Reason
            </Typography>
            <TextField
              fullWidth
              label="Reason for Appointment *"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              multiline
              rows={4}
              placeholder="Please describe your symptoms, concerns, or reason for this appointment in detail..."
              helperText="Be specific about your symptoms to help the doctor prepare"
            />
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Urgency Level</InputLabel>
              <Select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                label="Urgency Level"
              >
                <MenuItem value="ROUTINE">Routine Check-up</MenuItem>
                <MenuItem value="FOLLOWUP">Follow-up Visit</MenuItem>
                <MenuItem value="URGENT">Urgent Care</MenuItem>
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading || checkingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Book New Appointment
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Debug Info - Remove in production */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Debug Info:</strong> User: {user?.username} | Role: {user?.roles?.[0]} | 
              Patient Profile: {hasPatientProfile ? 'Yes' : 'No'} | 
              Doctors: {doctors.length} | Available Slots: {availableSlots.length}
            </Typography>
          </Alert>

          <Box component="form" onSubmit={activeStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={activeStep === 0 ? handleCancel : handleBack}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={activeStep === 1 && availableSlots.length === 0}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Next
                  </Button>
                )}
                
                {activeStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    {submitting ? 'Booking Appointment...' : 'Confirm & Book Appointment'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookAppointment;