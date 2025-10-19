import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/scheduleService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { formatDate, formatTime } from '../../utils/helpers';

const ManageSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    availableDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    maxPatients: 1,
  });

  useEffect(() => {
    if (user && user.id) {
      console.log('👤 Current user in ManageSchedule:', user);
      console.log('🆔 User ID:', user.id);
      loadSchedules();
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading schedules for user ID:', user.id);
      
      if (!user.id) {
        throw new Error('User ID not available');
      }

      // ✅ UPDATED: Use getDoctorOwnSchedules with user ID
      const data = await scheduleService.getDoctorOwnSchedules(user.id);
      console.log('✅ Schedules loaded:', data);
      
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading schedules:', err);
      setError('Failed to load schedules: ' + (err.message || 'Unknown error'));
      enqueueSnackbar('Failed to load schedules', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (!user.id) {
      setError('Cannot create schedule: User ID not available');
      enqueueSnackbar('Authentication issue. Please log out and log in again.', { variant: 'error' });
      return;
    }

    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        availableDate: schedule.availableDate,
        startTime: schedule.startTime || '09:00',
        endTime: schedule.endTime || '17:00',
        slotDuration: schedule.slotDuration || 30,
        maxPatients: schedule.maxPatients || 1,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        availableDate: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        maxPatients: 1,
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setError('');
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('🗑️ Deleting schedule:', scheduleToDelete.id);
      await scheduleService.delete(scheduleToDelete.id);
      setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
      enqueueSnackbar('Schedule deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error('❌ Error deleting schedule:', err);
      enqueueSnackbar('Failed to delete schedule: ' + (err.response?.data?.message || err.message), { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.availableDate) {
      setError('Date is required');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return false;
    }
    if (formData.slotDuration <= 0) {
      setError('Slot duration must be positive');
      return false;
    }
    if (formData.maxPatients <= 0) {
      setError('Maximum patients must be positive');
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!user.id) {
    setError('Cannot save schedule: User ID not available');
    return;
  }

  setSubmitting(true);
  setError('');

  if (!validateForm()) {
    setSubmitting(false);
    return;
  }

  try {
    const scheduleData = {
      doctorId: user.id, // ✅ FIXED: Include doctorId in the request
      availableDate: formData.availableDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      slotDuration: parseInt(formData.slotDuration),
      maxPatients: parseInt(formData.maxPatients),
    };

    console.log('💾 Saving schedule for user:', user.id);
    console.log('📅 Schedule data:', scheduleData);

    if (editingSchedule) {
      // ✅ FIXED: For update, just send the schedule data with doctorId
      await scheduleService.update(editingSchedule.id, scheduleData);
      enqueueSnackbar('Schedule updated successfully!', { variant: 'success' });
    } else {
      // For create, use createDoctorSchedule with user ID
      await scheduleService.createDoctorSchedule(user.id, scheduleData);
      enqueueSnackbar('Schedule created successfully!', { variant: 'success' });
    }

    handleCloseDialog();
    loadSchedules();
  } catch (err) {
    console.error('❌ Error saving schedule:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to save schedule';
    setError(errorMessage);
    enqueueSnackbar('Failed to save schedule: ' + errorMessage, { variant: 'error' });
  } finally {
    setSubmitting(false);
  }
};

  const getTimeSlots = (schedule) => {
    const slots = [];
    const start = new Date(`1970-01-01T${schedule.startTime}`);
    const end = new Date(`1970-01-01T${schedule.endTime}`);
    const duration = schedule.slotDuration || 30;

    let current = new Date(start);
    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd <= end) {
        slots.push({
          start: current.toTimeString().substring(0, 5),
          end: slotEnd.toTimeString().substring(0, 5)
        });
      }
      current = slotEnd;
    }
    return slots;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Schedule
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
          disabled={!user.id}
        >
          Add Time Slot
        </Button>
      </Box>

      {!user.id && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Authentication Issue
          </Typography>
          <Typography variant="body2">
            Your user ID is not available. Please log out and log in again.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Debug Info:</strong> User ID: {user?.id} | Username: {user?.username} | Schedules loaded: {schedules.length}
        </Typography>
      </Alert>

      {schedules.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Schedule Available
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Add your available time slots to allow patients to book appointments with you.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!user.id}
          >
            Add Your First Time Slot
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {schedules.map((schedule) => {
            const timeSlots = getTimeSlots(schedule);
            return (
              <Grid item xs={12} md={6} key={schedule.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatDate(schedule.availableDate)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(schedule)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(schedule)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<TimeIcon />}
                        label={`${schedule.slotDuration}min slots`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${schedule.maxPatients} patients max`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={schedule.isBooked ? 'Booked' : 'Available'}
                        color={schedule.isBooked ? 'error' : 'success'}
                        size="small"
                      />
                      {schedule.createdBy && (
                        <Chip
                          label={`Created by: ${schedule.createdBy}`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Available Time Slots:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {timeSlots.slice(0, 6).map((slot, index) => (
                        <Chip
                          key={index}
                          label={`${slot.start}-${slot.end}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ))}
                      {timeSlots.length > 6 && (
                        <Chip
                          label={`+${timeSlots.length - 6} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Schedule Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editingSchedule ? 'Edit Time Slot' : 'Add Time Slot'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Slot Duration</InputLabel>
                  <Select
                    name="slotDuration"
                    value={formData.slotDuration}
                    onChange={handleChange}
                    label="Slot Duration"
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Patients"
                  name="maxPatients"
                  type="number"
                  value={formData.maxPatients}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (editingSchedule ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Time Slot"
        message="Are you sure you want to delete this time slot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default ManageSchedule;