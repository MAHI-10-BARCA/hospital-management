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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PatientIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { patientService } from '../../services/patientService';
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
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
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

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getGenderLabel(patient.gender)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Patients
        </Typography>
        {hasPermission(user, 'manage_patients') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/patients/add')}
            sx={{ borderRadius: 2 }}
          >
            Add Patient
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients by name or gender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary">
            {filteredPatients.length} patients found
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'secondary.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <PatientIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {patient.name}
                    </Typography>
                    <Chip
                      label={getGenderLabel(patient.gender)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Age: {patient.age} years
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {patient.id}
                  </Typography>
                </Box>

                {hasPermission(user, 'manage_patients') && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(patient)}
                      sx={{
                        backgroundColor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(patient)}
                      sx={{
                        backgroundColor: 'error.light',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.main',
                        },
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
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">
            No patients found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
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