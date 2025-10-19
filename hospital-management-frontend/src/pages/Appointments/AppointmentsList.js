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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Schedule as HoldIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService'; // ✅ ADDED
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import PrescriptionForm from '../Prescription/PrescriptionForm';
import { 
  formatDate, 
  formatTime, 
  getStatusColor, 
  getStatusLabel,
  mapAppointmentData,
  APPOINTMENT_STATUS 
} from '../../utils/helpers';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [appointmentForStatus, setAppointmentForStatus] = useState(null);
  const [appointmentForEdit, setAppointmentForEdit] = useState(null);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);
  const [existingPrescription, setExistingPrescription] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [editReason, setEditReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      console.log('📅 Raw appointments data:', data);
      
      // Map data to ensure consistent structure
      const mappedAppointments = Array.isArray(data) ? data.map(mapAppointmentData) : [];
      console.log('📅 Mapped appointments:', mappedAppointments);
      
      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      setError('Failed to load appointments');
      enqueueSnackbar('Failed to load appointments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionClick = async (appointment) => {
    try {
      setSelectedAppointmentForPrescription(appointment);
      
      // Check if prescription already exists
      const prescription = await prescriptionService.getByAppointment(appointment.id);
      setExistingPrescription(prescription);
      setPrescriptionDialogOpen(true);
    } catch (error) {
      // No prescription exists, create new one
      console.log('No existing prescription found, creating new one');
      setExistingPrescription(null);
      setPrescriptionDialogOpen(true);
    }
  };

  const handleMenuOpen = (event, appointment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAppointment(null);
  };

  const handleStatusUpdate = async () => {
    if (!appointmentForStatus || !newStatus) return;

    try {
      await appointmentService.updateStatus(appointmentForStatus.id, newStatus);
      enqueueSnackbar(`Appointment status updated to ${getStatusLabel(newStatus)}`, { variant: 'success' });
      setStatusDialogOpen(false);
      setAppointmentForStatus(null);
      setNewStatus('');
      loadAppointments();
    } catch (err) {
      console.error('❌ Error updating status:', err);
      enqueueSnackbar('Failed to update appointment status', { variant: 'error' });
    }
  };

  const handleEditSave = async () => {
    if (!appointmentForEdit) return;

    try {
      await appointmentService.update(appointmentForEdit.id, {
        reason: editReason
      });
      enqueueSnackbar('Appointment updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
      setAppointmentForEdit(null);
      setEditReason('');
      loadAppointments();
    } catch (err) {
      console.error('❌ Error updating appointment:', err);
      enqueueSnackbar('Failed to update appointment', { variant: 'error' });
    }
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
    handleMenuClose();
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

  const handleStatusClick = (appointment) => {
    setAppointmentForStatus(appointment);
    setNewStatus(appointment.status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClick = (appointment) => {
    setAppointmentForEdit(appointment);
    setEditReason(appointment.reason || '');
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const getStatusOptions = () => {
    const baseOptions = [
      APPOINTMENT_STATUS.SCHEDULED,
      APPOINTMENT_STATUS.CONFIRMED,
      APPOINTMENT_STATUS.IN_PROGRESS,
      APPOINTMENT_STATUS.COMPLETED,
      APPOINTMENT_STATUS.CANCELLED
    ];
    
    if (hasPermission(user, 'manage_appointments')) {
      return baseOptions;
    } else if (hasPermission(user, 'manage_schedules')) {
      // Doctors can update to these statuses
      return [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.IN_PROGRESS, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED];
    }
    
    return [];
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status) => {
    return (
      <Chip
        label={getStatusLabel(status)}
        color={getStatusColor(status)}
        size="small"
        variant="filled"
        sx={{ fontWeight: 'bold', minWidth: 100 }}
      />
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Appointments
        </Typography>
        {hasPermission(user, 'book_appointments') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/book')}
            sx={{ borderRadius: 2 }}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search appointments by patient, doctor, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.SCHEDULED}>Scheduled</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.CONFIRMED}>Confirmed</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary" align="center">
                {filteredAppointments.length} appointments
              </Typography>
            </Grid>
          </Grid>
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
          <Grid item xs={12} key={appointment.id}>
            <Card
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                borderRadius: 3,
                borderLeft: `4px solid ${getStatusColor(appointment.status)}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Header with Patient and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" />
                          {appointment.patientName || 'Unknown Patient'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <DoctorIcon fontSize="small" />
                          with Dr. {appointment.doctorName || 'Unknown Doctor'}
                          {appointment.doctorSpecialization && ` • ${appointment.doctorSpecialization}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusChip(appointment.status)}
                        {(hasPermission(user, 'manage_appointments') || hasPermission(user, 'manage_schedules')) && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, appointment)}
                          >
                            <MoreIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {/* Appointment Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TimeIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Time:</strong> {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Reason:</strong> {appointment.reason || 'No reason provided'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          <strong>Created:</strong> {appointment.createdDate ? new Date(appointment.createdDate).toLocaleString() : 'Unknown'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAppointments.length === 0 && !loading && (
        <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Get started by booking your first appointment'}
          </Typography>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusClick(selectedAppointment)}>
          <AcceptIcon sx={{ mr: 1 }} /> Update Status
        </MenuItem>
        <MenuItem onClick={() => handleEditClick(selectedAppointment)}>
          <EditIcon sx={{ mr: 1 }} /> Edit Reason
        </MenuItem>
        
        {/* Prescription Button for COMPLETED or IN_PROGRESS appointments */}
        {(selectedAppointment?.status === 'COMPLETED' || selectedAppointment?.status === 'IN_PROGRESS') && (
          <MenuItem onClick={() => handlePrescriptionClick(selectedAppointment)}>
            <DescriptionIcon sx={{ mr: 1 }} /> 
            {existingPrescription ? 'View Prescription' : 'Create Prescription'}
          </MenuItem>
        )}
        
        {hasPermission(user, 'manage_appointments') && (
          <MenuItem onClick={() => handleDeleteClick(selectedAppointment)} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete Appointment
          </MenuItem>
        )}
      </Menu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {getStatusOptions().map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusChip(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {appointmentForStatus && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Patient: <strong>{appointmentForStatus.patientName}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Doctor: <strong>Dr. {appointmentForStatus.doctorName}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Date: <strong>{formatDate(appointmentForStatus.appointmentDate)}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Reason Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Appointment Reason</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Appointment Reason"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            sx={{ mt: 2 }}
          />
          {appointmentForEdit && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Patient: <strong>{appointmentForEdit.patientName}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Date: <strong>{formatDate(appointmentForEdit.appointmentDate)}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            disabled={!editReason.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Dialog */}
      <PrescriptionForm
        open={prescriptionDialogOpen}
        onClose={(refresh) => {
          setPrescriptionDialogOpen(false);
          setSelectedAppointmentForPrescription(null);
          setExistingPrescription(null);
          if (refresh) {
            loadAppointments();
          }
        }}
        appointment={selectedAppointmentForPrescription}
        prescription={existingPrescription}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment for ${appointmentToDelete?.patientName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default AppointmentsList;