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
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as DoctorIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/helpers';
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
  const { user } = useAuth();

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
          Doctors
        </Typography>
        {hasPermission(user, 'manage_doctors') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/doctors/add')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0da271 0%, #047852 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Doctor
          </Button>
        )}
      </Box>

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
            placeholder="Search doctors by name or specialization..."
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
            {filteredDoctors.length} doctors found
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

      {/* Doctors Grid */}
      <Grid container spacing={3}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor.id}>
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '14px',
                      p: 2,
                      mr: 2,
                      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <DoctorIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      fontWeight="bold"
                      sx={{ color: '#1e293b' }}
                    >
                      {doctor.name}
                    </Typography>
                    <Chip
                      label={doctor.specialization}
                      size="small"
                      sx={{
                        mt: 1,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748b',
                    fontWeight: 500,
                    mb: 3,
                  }}
                >
                  Contact: {doctor.contact}
                </Typography>

                {hasPermission(user, 'manage_doctors') && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(doctor)}
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
                      onClick={() => handleDeleteClick(doctor)}
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

      {filteredDoctors.length === 0 && !loading && (
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
          <DoctorIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2, opacity: 0.7 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              mb: 1,
              fontWeight: 600,
            }}
          >
            No doctors found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
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