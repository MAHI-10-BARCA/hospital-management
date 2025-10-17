import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as AppointmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { appointmentService } from '../../services/appointmentService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { getStatusColor, formatDate, formatTime } from '../../utils/helpers';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
      enqueueSnackbar('Failed to load appointments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await appointmentService.delete(appointmentToDelete.id);
      setAppointments(appointments.filter(a => a.id !== appointmentToDelete.id));
      enqueueSnackbar('Appointment deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete appointment', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/book')}
          sx={{ borderRadius: 2 }}
        >
          Book Appointment
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search appointments by patient, doctor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary">
            {filteredAppointments.length} appointments found
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Appointments List */}
      <Grid container spacing={3}>
        {filteredAppointments.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment.id}>
            <Card
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <AppointmentIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          {appointment.patient?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          with Dr. {appointment.doctor?.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Date:</strong> {formatDate(appointment.schedule?.availableDate)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Time:</strong> {formatTime(appointment.schedule?.startTime)} - {formatTime(appointment.schedule?.endTime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Reason:</strong> {appointment.reason}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(appointment)}
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

      {filteredAppointments.length === 0 && !loading && (
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">
            No appointments found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by booking your first appointment'}
          </Typography>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment for ${appointmentToDelete?.patient?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default AppointmentsList;