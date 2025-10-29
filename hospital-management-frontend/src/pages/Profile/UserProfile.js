import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Grid,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocalHospital as MedicalIcon,
  ContactPhone as ContactIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getUserInitials } from '../../utils/helpers';

const UserProfile = () => {
  const { user, profile, refreshProfile, isDoctor, isPatient } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile]);

  // Debug: Check what data we're receiving
  useEffect(() => {
    console.log('=== PROFILE DEBUG ===');
    console.log('Full Profile:', profile);
    console.log('User Profile Data:', profile?.userProfile);
    console.log('Is Doctor:', isDoctor);
    console.log('Is Patient:', isPatient);
    console.log('Doctor Fields - Specialization:', profile?.specialization);
    console.log('Patient Fields - Blood Group:', profile?.bloodGroup);
  }, [profile, isDoctor, isPatient]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      await refreshProfile();
    } catch (err) {
      setError('Failed to load profile');
      enqueueSnackbar('Failed to load profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  // Check if we have professional/medical data to show
  const hasProfessionalData = isDoctor && (
    profile?.specialization || 
    profile?.experienceYears || 
    profile?.qualifications
  );

  const hasMedicalData = isPatient && (
    profile?.bloodGroup || 
    profile?.height || 
    profile?.weight ||
    profile?.allergies
  );

  const InfoItem = ({ label, value }) => (
    <Box sx={{ mb: 2.5 }}>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        fontWeight="600"
        sx={{ mb: 0.5, fontSize: '0.875rem' }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.primary',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          padding: '8px 12px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {value || 'Not set'}
      </Typography>
    </Box>
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

  const renderPersonalInfo = () => (
    <Box sx={{ mb: 4 }}>
      <SectionHeader title="Personal Information" icon={PersonIcon} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InfoItem label="First Name" value={profile?.userProfile?.firstName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Last Name" value={profile?.userProfile?.lastName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Email" value={profile?.userProfile?.email} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Phone" value={profile?.userProfile?.phoneNumber} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Date of Birth" value={profile?.userProfile?.dateOfBirth} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Gender" value={profile?.userProfile?.gender} />
        </Grid>
        <Grid item xs={12}>
          <InfoItem label="Bio" value={profile?.userProfile?.bio} />
        </Grid>
      </Grid>
    </Box>
  );

  const renderAddressInfo = () => (
    <Box sx={{ mb: 4 }}>
      <SectionHeader title="Address Information" icon={PersonIcon} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InfoItem label="Address" value={profile?.userProfile?.address} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="City" value={profile?.userProfile?.city} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="State" value={profile?.userProfile?.state} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Zip Code" value={profile?.userProfile?.zipCode} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem label="Country" value={profile?.userProfile?.country} />
        </Grid>
      </Grid>
    </Box>
  );

  const renderDoctorInfo = () => {
    if (!isDoctor || !hasProfessionalData) {
      return (
        <Box sx={{ mb: 4 }}>
          <SectionHeader title="Professional Information" icon={WorkIcon} />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontStyle: 'italic',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            No professional information available. Please update your profile.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Professional Information" icon={WorkIcon} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Specialization" value={profile?.specialization} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem 
              label="Experience" 
              value={profile?.experienceYears ? `${profile.experienceYears} years` : null} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="License Number" value={profile?.licenseNumber} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Department" value={profile?.department} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem 
              label="Consultation Fee" 
              value={profile?.consultationFee ? `$${profile.consultationFee}` : null} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Languages Spoken" value={profile?.languagesSpoken} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Qualifications" value={profile?.qualifications} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Awards & Honors" value={profile?.awardsHonors} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Professional Bio" value={profile?.professionalBio} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Office Location" value={profile?.officeLocation} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Office Hours" value={profile?.officeHours} />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPatientInfo = () => {
    if (!isPatient || !hasMedicalData) {
      return (
        <Box sx={{ mb: 4 }}>
          <SectionHeader title="Medical Information" icon={MedicalIcon} />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontStyle: 'italic',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            No medical information available. Please update your profile.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Medical Information" icon={MedicalIcon} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Blood Group" value={profile?.bloodGroup} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem 
              label="Height" 
              value={profile?.height ? `${profile.height} cm` : null} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem 
              label="Weight" 
              value={profile?.weight ? `${profile.weight} kg` : null} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Marital Status" value={profile?.maritalStatus} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Occupation" value={profile?.occupation} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Allergies" value={profile?.allergies} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Current Medications" value={profile?.currentMedications} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Past Medical History" value={profile?.pastMedicalHistory} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem label="Family Medical History" value={profile?.familyMedicalHistory} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Insurance Provider" value={profile?.insuranceProvider} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Preferred Pharmacy" value={profile?.preferredPharmacy} />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderEmergencyContact = () => (
    <Box sx={{ mb: 4 }}>
      <SectionHeader title="Emergency Contact" icon={ContactIcon} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InfoItem 
            label="Emergency Contact Name" 
            value={profile?.userProfile?.emergencyContactName} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem 
            label="Emergency Contact Phone" 
            value={profile?.userProfile?.emergencyContactPhone} 
          />
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) return <LoadingSpinner />;
  
  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load profile data
        </Alert>
        <Button 
          onClick={loadProfile} 
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            },
          }}
        >
          Retry Loading Profile
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      p: 3
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
        My Profile
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {getUserInitials(
                    (profile?.userProfile?.firstName && profile?.userProfile?.lastName) 
                      ? `${profile.userProfile.firstName} ${profile.userProfile.lastName}`
                      : profile?.username || 'U'
                  )}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" component="h2" fontWeight="600">
                    {profile?.userProfile?.firstName && profile?.userProfile?.lastName
                      ? `${profile.userProfile.firstName} ${profile.userProfile.lastName}`
                      : profile?.username}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      mt: 0.5,
                      fontStyle: profile?.userProfile?.bio ? 'normal' : 'italic'
                    }}
                  >
                    {profile?.userProfile?.bio || 'No bio available'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Edit Profile
                </Button>
              </Box>

              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)} 
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': {
                    borderRadius: '12px 12px 0 0',
                    fontWeight: 600,
                  }
                }}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab icon={<PersonIcon />} label="Personal" />
                <Tab 
                  icon={isDoctor ? <WorkIcon /> : <MedicalIcon />} 
                  label={isDoctor ? 'Professional' : isPatient ? 'Medical' : 'Additional'} 
                />
                <Tab icon={<ContactIcon />} label="Contact" />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                  <>
                    {renderPersonalInfo()}
                    {renderAddressInfo()}
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    {isDoctor && renderDoctorInfo()}
                    {isPatient && renderPatientInfo()}
                    {!isDoctor && !isPatient && (
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          py: 4
                        }}
                      >
                        No additional information available for your role.
                      </Typography>
                    )}
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    {renderEmergencyContact()}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight="600"
                sx={{ 
                  color: 'text.primary',
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Account Information
              </Typography>
              <Box sx={{ pl: 1 }}>
                <InfoItem label="Username" value={profile?.username} />
                <InfoItem label="User ID" value={profile?.id} />
                
                <Box sx={{ mb: 2.5 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontWeight="600"
                    sx={{ mb: 1, fontSize: '0.875rem' }}
                  >
                    Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user?.roles?.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.replace('ROLE_', '')}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          border: '2px solid',
                          borderRadius: '8px',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;