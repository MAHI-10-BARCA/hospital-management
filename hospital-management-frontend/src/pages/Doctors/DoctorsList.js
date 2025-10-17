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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as DoctorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
      enqueueSnackbar('Failed to load doctors', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await doctorService.delete(doctorToDelete.id);
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      enqueueSnackbar('Doctor deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete doctor', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
    }
  };

  const handleEdit = (doctor) => {
    navigate(`/doctors/edit/${doctor.id}`);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Doctors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/doctors/add')}
          sx={{ borderRadius: 2 }}
        >
          Add Doctor
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary">
            {filteredDoctors.length} doctors found
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Doctors Grid */}
      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor.id}>
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
                      backgroundColor: 'primary.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <DoctorIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {doctor.name}
                    </Typography>
                    <Chip
                      label={doctor.specialization}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Contact: {doctor.contact}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(doctor)}
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
                    onClick={() => handleDeleteClick(doctor)}
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDoctors.length === 0 && !loading && (
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">
            No doctors found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first doctor'}
          </Typography>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message={`Are you sure you want to delete ${doctorToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default DoctorsList;