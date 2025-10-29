import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  MenuItem,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocalHospital as MedicalIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const steps = ['Personal Information', 'Contact Details', 'Professional Info'];

const EditProfile = () => {
  const { profile, refreshProfile, isDoctor, isPatient } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [userForm, setUserForm] = useState({});
  const [addressForm, setAddressForm] = useState({});
  const [emergencyForm, setEmergencyForm] = useState({});
  const [doctorForm, setDoctorForm] = useState({});
  const [patientForm, setPatientForm] = useState({});

  useEffect(() => {
    if (profile) {
      loadFormData();
    }
  }, [profile]);

  const loadFormData = () => {
    if (profile.userProfile) {
      setUserForm({
        firstName: profile.userProfile.firstName || '',
        lastName: profile.userProfile.lastName || '',
        email: profile.userProfile.email || '',
        phoneNumber: profile.userProfile.phoneNumber || '',
        dateOfBirth: profile.userProfile.dateOfBirth || '',
        gender: profile.userProfile.gender || '',
        bio: profile.userProfile.bio || ''
      });
      
      setAddressForm({
        address: profile.userProfile.address || '',
        city: profile.userProfile.city || '',
        state: profile.userProfile.state || '',
        zipCode: profile.userProfile.zipCode || '',
        country: profile.userProfile.country || ''
      });
      
      setEmergencyForm({
        emergencyContactName: profile.userProfile.emergencyContactName || '',
        emergencyContactPhone: profile.userProfile.emergencyContactPhone || ''
      });
    }

    if (isDoctor && profile) {
      setDoctorForm({
        name: profile.name || '',
        specialization: profile.specialization || '',
        contact: profile.contact || '',
        qualifications: profile.qualifications || '',
        experienceYears: profile.experienceYears || '',
        licenseNumber: profile.licenseNumber || '',
        department: profile.department || '',
        consultationFee: profile.consultationFee || ''
      });
    }

    if (isPatient && profile) {
      setPatientForm({
        name: profile.name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        bloodGroup: profile.bloodGroup || '',
        height: profile.height || '',
        weight: profile.weight || '',
        allergies: profile.allergies || '',
        currentMedications: profile.currentMedications || ''
      });
    }
    
    setLoading(false);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Update user profile
      const userProfileData = {
        ...userForm,
        ...addressForm,
        ...emergencyForm
      };

      await profileService.updateUserProfile(userProfileData);

      // Update role-specific profile
      if (isDoctor) {
        await profileService.updateDoctorProfile(doctorForm);
      } else if (isPatient) {
        await profileService.updatePatientProfile(patientForm);
      }

      await refreshProfile();
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const StyledTextField = (props) => (
    <TextField
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          '&:hover fieldset': {
            borderColor: '#6366f1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#6366f1',
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#6366f1',
        },
      }}
    />
  );

  const StyledSelect = (props) => (
    <FormControl fullWidth>
      <InputLabel>{props.label}</InputLabel>
      <Select
        {...props}
        sx={{
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6366f1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6366f1',
            borderWidth: '2px',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '12px',
              marginTop: '8px',
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          },
        }}
      />
    </FormControl>
  );

  const SectionHeader = ({ title, icon: Icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Icon sx={{ 
        mr: 1.5, 
        color: 'primary.main',
        fontSize: '1.5rem'
      }} />
      <Typography 
        variant="h6" 
        fontWeight="600"
        sx={{ 
          color: 'text.primary',
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const renderPersonalInfoStep = () => (
    <Box>
      <SectionHeader title="Personal Information" icon={PersonIcon} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="First Name"
            value={userForm.firstName || ''}
            onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Last Name"
            value={userForm.lastName || ''}
            onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Email"
            type="email"
            value={userForm.email || ''}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Phone Number"
            value={userForm.phoneNumber || ''}
            onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={userForm.dateOfBirth || ''}
            onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledSelect
            label="Gender"
            value={userForm.gender || ''}
            onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
            <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
          </StyledSelect>
        </Grid>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={userForm.bio || ''}
            onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
            placeholder="Tell us about yourself..."
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderContactStep = () => (
    <Box>
      <SectionHeader title="Contact & Address Information" icon={HomeIcon} />

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: 'primary.main', fontWeight: 600 }}>
        Address Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Address"
            value={addressForm.address || ''}
            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="City"
            value={addressForm.city || ''}
            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="State"
            value={addressForm.state || ''}
            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Zip Code"
            value={addressForm.zipCode || ''}
            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Country"
            value={addressForm.country || ''}
            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

      <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Emergency Contact
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Emergency Contact Name"
            value={emergencyForm.emergencyContactName || ''}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, emergencyContactName: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Emergency Contact Phone"
            value={emergencyForm.emergencyContactPhone || ''}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, emergencyContactPhone: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderProfessionalStep = () => (
    <Box>
      {isDoctor && (
        <>
          <SectionHeader title="Professional Information" icon={WorkIcon} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Full Name"
                value={doctorForm.name || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Specialization"
                value={doctorForm.specialization || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Contact Information"
                value={doctorForm.contact || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, contact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="License Number"
                value={doctorForm.licenseNumber || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Department"
                value={doctorForm.department || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Experience (Years)"
                type="number"
                value={doctorForm.experienceYears || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Consultation Fee"
                type="number"
                value={doctorForm.consultationFee || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Languages Spoken"
                value={doctorForm.languagesSpoken || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, languagesSpoken: e.target.value })}
                placeholder="English, Spanish, French..."
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Qualifications"
                multiline
                rows={2}
                value={doctorForm.qualifications || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Awards & Honors"
                multiline
                rows={2}
                value={doctorForm.awardsHonors || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, awardsHonors: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Professional Bio"
                multiline
                rows={3}
                value={doctorForm.professionalBio || ''}
                onChange={(e) => setDoctorForm({ ...doctorForm, professionalBio: e.target.value })}
              />
            </Grid>
          </Grid>
        </>
      )}

      {isPatient && (
        <>
          <SectionHeader title="Medical Information" icon={MedicalIcon} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Full Name"
                value={patientForm.name || ''}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Age"
                type="number"
                value={patientForm.age || ''}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledSelect
                label="Gender"
                value={patientForm.gender || ''}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </StyledSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledSelect
                label="Blood Group"
                value={patientForm.bloodGroup || ''}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </StyledSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={patientForm.height || ''}
                onChange={(e) => setPatientForm({ ...patientForm, height: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={patientForm.weight || ''}
                onChange={(e) => setPatientForm({ ...patientForm, weight: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Allergies"
                multiline
                rows={2}
                value={patientForm.allergies || ''}
                onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                placeholder="List any allergies..."
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Current Medications"
                multiline
                rows={2}
                value={patientForm.currentMedications || ''}
                onChange={(e) => setPatientForm({ ...patientForm, currentMedications: e.target.value })}
                placeholder="List current medications..."
              />
            </Grid>
          </Grid>
        </>
      )}

      {!isDoctor && !isPatient && (
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 4 }}>
          No additional professional information required for your role.
        </Typography>
      )}
    </Box>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      p: 3,
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      minHeight: '100vh'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        fontWeight="700"
        sx={{ 
          color: 'text.primary',
          mb: 4
        }}
      >
        Edit Profile
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#6366f1',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#6366f1',
              },
            }}
          >
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
                backdropFilter: 'blur(10px)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            {activeStep === 0 && renderPersonalInfoStep()}
            {activeStep === 1 && renderContactStep()}
            {activeStep === 2 && renderProfessionalStep()}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                px: 3,
                border: '2px solid',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Back
            </Button>

            <Box>
              <Button
                onClick={() => navigate('/profile')}
                sx={{ 
                  mr: 2,
                  borderRadius: '12px',
                  fontWeight: 600,
                  px: 3,
                  border: '2px solid',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={submitting}
                  startIcon={<SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditProfile;