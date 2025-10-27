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
  alpha,
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
  const { user, hasRole } = useAuth();

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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setCheckingProfile(true);
      
      console.log('🔄 Loading initial data for appointment booking...');
      
      // Load doctors first
      console.log('👨‍⚕️ Loading doctors list...');
      const doctorsData = await doctorService.getAll();
      console.log('✅ Doctors loaded:', doctorsData);
      setDoctors(doctorsData);

      // Check patient profile
      if (user && hasRole('PATIENT')) {
        try {
          console.log('🔍 Checking patient profile for user:', user.username);
          const patientProfile = await patientService.getMyPatientProfile();
          console.log('✅ Patient profile found:', patientProfile);
          setHasPatientProfile(true);
          
          // Set the patient ID for the form
          setFormData(prev => ({ 
            ...prev, 
            patientId: patientProfile.id 
          }));
        } catch (error) {
          console.log('❌ Patient profile not found:', error.message);
          setHasPatientProfile(false);
        }
      } else {
        console.log('👤 User is not a patient, skipping profile check');
        setHasPatientProfile(true);
      }

      // Load patients list for admins/doctors
      if (hasPermission(user, 'manage_patients')) {
        const patientsData = await patientService.getAll();
        console.log('👥 Patients loaded:', patientsData.length, 'patients');
        setPatients(patientsData);
      } else {
        // For regular patients, use their own profile
        setPatients([]);
        console.log('ℹ️ User cannot manage patients, using own profile');
      }

      console.log('✅ Initial data loaded successfully');
      console.log('📊 Data summary:', {
        doctors: doctorsData.length,
        patients: patients.length,
        hasPatientProfile,
        userRole: user?.roles?.[0]
      });
      
    } catch (err) {
      console.error('❌ Error loading initial data:', err);
      setError('Failed to load initial data. Please refresh the page.');
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
      setCheckingProfile(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      console.log('🔄 Loading available slots for doctor ID:', formData.doctorId);
      
      if (!formData.doctorId) {
        console.error('❌ No doctor ID selected');
        setAvailableSlots([]);
        return;
      }

      // ✅ FIXED: Use doctor ID directly
      const slots = await scheduleService.getAvailableByDoctor(parseInt(formData.doctorId));
      console.log('✅ Available slots loaded:', slots);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('❌ Error loading available slots:', err);
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

  const handleNext = () => {
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

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

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

      const appointmentData = {
        patient: { id: patientId },
        doctor: { id: parseInt(formData.doctorId) },
        schedule: { id: parseInt(formData.scheduleId) },
        status: 'SCHEDULED',
        reason: formData.reason
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

  const handleCancel = () => {
    navigate('/appointments');
  };

  const handleProfileCreated = (profile) => {
    setHasPatientProfile(true);
    loadInitialData();
  };

  const getSelectedPatient = () => {
    if (formData.patientId === 'self') {
      return { name: user?.username || 'Current User', age: 'N/A', gender: 'N/A' };
    }
    return patients.find(p => p.id === parseInt(formData.patientId));
  };
  
  const getSelectedDoctor = () => doctors.find(d => d.id === parseInt(formData.doctorId));
  const getSelectedSlot = () => availableSlots.find(s => s.id === parseInt(formData.scheduleId));

  if (user && hasRole('PATIENT') && !hasPatientProfile && !checkingProfile) {
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
          Book New Appointment
        </Typography>
        <PatientProfileSetup onProfileCreated={handleProfileCreated} />
      </Box>
    );
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {hasPermission(user, 'manage_patients') && (
              <>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    color: '#6366f1',
                    fontWeight: 600,
                  }}
                >
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Age: {patient.age} • Gender: {patient.gender}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              <DoctorIcon /> Choose Doctor
            </Typography>
            
            {doctors.length === 0 ? (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  No Doctors Available
                </Typography>
                <Typography variant="body2">
                  There are no doctors registered in the system yet.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please contact the hospital administration to add doctors to the system.
                </Typography>
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Doctor *</InputLabel>
                <Select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  label="Select Doctor *"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Dr. {doctor.name || 'Unnamed Doctor'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {doctor.specialization || 'General'} • Contact: {doctor.contact || 'Not provided'}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: '#10b981', fontSize: '0.7rem' }}>
                          Doctor ID: {doctor.id}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {getSelectedDoctor() && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Selected Doctor:
                </Typography>
                <Typography variant="body2">
                  Dr. {getSelectedDoctor().name || 'Unnamed Doctor'} - {getSelectedDoctor().specialization || 'General'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#64748b' }}>
                  Doctor ID: {getSelectedDoctor().id}
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#f59e0b',
                fontWeight: 600,
              }}
            >
              <ScheduleIcon /> Pick Time Slot
            </Typography>
            
            {availableSlots.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                >
                  {availableSlots.map((slot) => (
                    <MenuItem key={slot.id} value={slot.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {formatDate(slot.availableDate)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: '#10b981' }}>
                          {slot.slotDuration}min slots • Max {slot.maxPatients} patient(s)
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {getSelectedSlot() && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                }}
              >
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
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#8b5cf6',
                fontWeight: 600,
              }}
            >
              <ConfirmIcon /> Confirm Appointment Details
            </Typography>
            
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Patient</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getSelectedPatient()?.name || user?.username || 'Current User'}
                  </Typography>
                  {hasPermission(user, 'manage_patients') && getSelectedPatient()?.age !== 'N/A' && (
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Age: {getSelectedPatient()?.age} • Gender: {getSelectedPatient()?.gender}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Doctor</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Dr. {getSelectedDoctor()?.name || 'Unnamed Doctor'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {getSelectedDoctor()?.specialization || 'General'}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: '#94a3b8' }}>
                    Doctor ID: {getSelectedDoctor()?.id}
                  </Typography>
                </Grid>
                
                {getSelectedSlot() && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Date & Time</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDate(getSelectedSlot()?.availableDate)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {formatTime(getSelectedSlot()?.startTime)} - {formatTime(getSelectedSlot()?.endTime)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Slot Details</Typography>
                      <Typography variant="body2">
                        {getSelectedSlot()?.slotDuration} minute slots
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Max {getSelectedSlot()?.maxPatients} patient(s) per slot
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b' }}>Urgency</Typography>
                  <Chip 
                    label={formData.urgency} 
                    size="small" 
                    sx={{
                      background: formData.urgency === 'URGENT' 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontWeight: '600',
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mt: 3,
                color: '#6366f1',
                fontWeight: 600,
              }}
            >
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }
              }}
            />
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Urgency Level</InputLabel>
              <Select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                label="Urgency Level"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                  }
                }}
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
        Book New Appointment
      </Typography>

      <Card 
        sx={{ 
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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

          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <Typography variant="body2">
              <strong>Debug Info:</strong> User: {user?.username} | Role: {user?.roles?.[0]} | 
              Patient Profile: {hasPatientProfile ? 'Yes' : 'No'} | 
              Doctors: {doctors.length} | Available Slots: {availableSlots.length}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Available Doctor IDs: {doctors.map(d => d.id).join(', ')}
            </Typography>
          </Alert>

          <Box component="form" onSubmit={activeStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={activeStep === 0 ? handleCancel : handleBack}
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
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={activeStep === 1 && availableSlots.length === 0}
                    sx={{ 
                      borderRadius: '12px', 
                      px: 4,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5b5cdc 0%, #7c51e0 100%)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Next
                  </Button>
                )}
                
                {activeStep === steps.length - 1 && (
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