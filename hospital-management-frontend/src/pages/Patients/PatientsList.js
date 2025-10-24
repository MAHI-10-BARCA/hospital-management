import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  TextField,
  Alert,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PatientIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { GENDER_OPTIONS } from '../../utils/constants';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      let patientsData = [];
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        // Admin sees all patients
        patientsData = await patientService.getAll();
        console.log('👑 ADMIN: Loading all patients from database');
      } else if (user?.roles?.includes('ROLE_DOCTOR')) {
        // ✅ DOCTOR: Only see patients who have appointments with them
        const doctorProfile = await doctorService.getMyDoctorProfile();
        const appointments = await appointmentService.getByDoctor(doctorProfile.id);
        
        // Extract unique patients from doctor's appointments
        const uniquePatientIds = new Set();
        const doctorPatients = [];
        
        appointments.forEach(apt => {
          if (apt.patientId && !uniquePatientIds.has(apt.patientId)) {
            uniquePatientIds.add(apt.patientId);
            doctorPatients.push({
              id: apt.patientId,
              name: apt.patientName || 'Unknown Patient',
              // Get additional details if available
              lastAppointment: apt.appointmentDate || apt.availableDate,
              appointmentStatus: apt.status
            });
          }
        });
        
        console.log(`👨‍⚕️ DOCTOR ${doctorProfile.id}: Found ${doctorPatients.length} patients from ${appointments.length} appointments`);
        
        // Try to get full patient details
        patientsData = await Promise.all(
          doctorPatients.map(async (patient) => {
            try {
              const fullPatient = await patientService.getById(patient.id);
              return {
                ...fullPatient,
                lastAppointment: patient.lastAppointment,
                appointmentStatus: patient.appointmentStatus,
                isMyPatient: true // Flag to indicate this is doctor's patient
              };
            } catch (error) {
              console.warn(`⚠️ Could not get full details for patient ${patient.id}:`, error.message);
              return {
                id: patient.id,
                name: patient.name,
                age: 'Unknown',
                gender: 'Unknown',
                lastAppointment: patient.lastAppointment,
                appointmentStatus: patient.appointmentStatus,
                isMyPatient: true
              };
            }
          })
        );
        
      } else if (user?.roles?.includes('ROLE_PATIENT')) {
        // Patients see only themselves
        const patientProfile = await patientService.getMyPatientProfile();
        patientsData = [patientProfile];
      } else {
        patientsData = await patientService.getAll();
      }
      
      setPatients(patientsData);
      
    } catch (err) {
      console.error('❌ Error loading patients:', err);
      setError('Failed to load patients');
      enqueueSnackbar('Failed to load patients', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await patientService.delete(patientToDelete.id);
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      enqueueSnackbar('Patient deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete patient', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleEdit = (patient) => {
    navigate(`/patients/edit/${patient.id}`);
  };

  const getGenderLabel = (gender) => {
    const genderOption = GENDER_OPTIONS.find(opt => opt.value === gender);
    return genderOption ? genderOption.label : gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'SCHEDULED': return '#f59e0b';
      case 'CANCELLED': return '#ef4444';
      default: return '#64748b';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getGenderLabel(patient.gender)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.age?.toString().includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {user?.roles?.includes('ROLE_DOCTOR') ? 'My Patients' : 'Patients'}
        </Typography>
        
        {/* Show different buttons based on role */}
        {user?.roles?.includes('ROLE_ADMIN') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/patients/add')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c51e0 0%, #6d28d9 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Patient
          </Button>
        )}
        
        {user?.roles?.includes('ROLE_DOCTOR') && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {patients.length} patients under my care
          </Typography>
        )}
      </Box>

      {/* Role-specific information */}
      {user?.roles?.includes('ROLE_DOCTOR') && (
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
            <strong>Doctor View:</strong> You are seeing only patients who have scheduled appointments with you.
            {patients.length === 0 && ' No patients have booked appointments with you yet.'}
          </Typography>
        </Alert>
      )}

      {/* Search Bar */}
      <Card 
        sx={{ 
          mb: 4, 
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients by name or gender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: '#64748b', mr: 1 }} />
              ),
              sx: {
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
              }
            }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              mt: 2,
              fontWeight: 500,
            }}
          >
            {filteredPatients.length} patients found
            {user?.roles?.includes('ROLE_DOCTOR') && ' (from your appointments)'}
          </Typography>
        </CardContent>
      </Card>

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

      {/* Patients Grid */}
      <Grid container spacing={3}>
        {filteredPatients.map((patient) => (
          <Grid item xs={12} sm={6} md={4} key={patient.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: patient.isMyPatient 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      background: patient.isMyPatient
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '14px',
                      p: 2,
                      mr: 2,
                      boxShadow: patient.isMyPatient
                        ? '0 4px 14px 0 rgba(16, 185, 129, 0.3)'
                        : '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <PatientIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      fontWeight="bold"
                      sx={{ color: '#1e293b' }}
                    >
                      {patient.name}
                    </Typography>
                    <Chip
                      label={getGenderLabel(patient.gender)}
                      size="small"
                      sx={{
                        mt: 1,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Age: {patient.age || 'Unknown'} years
                  </Typography>
                  
                  {/* Show last appointment info for doctor's patients */}
                  {patient.isMyPatient && patient.lastAppointment && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CalendarIcon sx={{ color: '#64748b', fontSize: '16px' }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748b',
                          fontWeight: 500,
                        }}
                      >
                        Last: {formatDate(patient.lastAppointment)}
                      </Typography>
                    </Box>
                  )}
                  
                  {patient.isMyPatient && patient.appointmentStatus && (
                    <Chip
                      label={patient.appointmentStatus}
                      size="small"
                      sx={{
                        background: getAppointmentStatusColor(patient.appointmentStatus),
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                      mt: 1,
                    }}
                  >
                    ID: {patient.id}
                  </Typography>
                </Box>

                {/* Only ADMIN can edit/delete patients - DOCTOR cannot */}
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(patient)}
                      sx={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '8px',
                        color: '#6366f1',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.15)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(patient)}
                      sx={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.15)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPatients.length === 0 && !loading && (
        <Card 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <PatientIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2, opacity: 0.7 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              mb: 1,
              fontWeight: 600,
            }}
          >
            {user?.roles?.includes('ROLE_DOCTOR') ? 'No Patients Under Your Care' : 'No patients found'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : user?.roles?.includes('ROLE_DOCTOR') 
                ? 'Patients will appear here once they book appointments with you' 
                : 'Get started by adding your first patient'
            }
          </Typography>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${patientToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default PatientsList;