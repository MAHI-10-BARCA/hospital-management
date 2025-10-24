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
  const [doctorProfile, setDoctorProfile] = useState(null);
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
    if (user) {
      loadDoctorProfileAndSchedules();
    }
  }, [user]);

  // ✅ FIXED: Load doctor profile first, then schedules
  const loadDoctorProfileAndSchedules = async () => {
    try {
      setLoading(true);
      
      // First get the doctor profile to get the correct doctor ID
      const profile = await scheduleService.getMyDoctorProfile();
      setDoctorProfile(profile);
      
      console.log('👤 Doctor profile loaded:', profile);
      console.log('🆔 Using doctor ID:', profile.id);
      
      // Then load schedules using the correct doctor ID
      if (profile && profile.id) {
        const data = await scheduleService.getDoctorOwnSchedules(profile.id);
        setSchedules(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Doctor profile not found');
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError('Failed to load schedules: ' + (err.message || 'Unknown error'));
      enqueueSnackbar('Failed to load schedules', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (!doctorProfile || !doctorProfile.id) {
      setError('Cannot create schedule: Doctor profile not available. Please complete your doctor profile first.');
      enqueueSnackbar('Doctor profile not found', { variant: 'error' });
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
      await scheduleService.delete(scheduleToDelete.id);
      setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
      enqueueSnackbar('Schedule deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting schedule:', err);
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
    
    if (!doctorProfile || !doctorProfile.id) {
      setError('Cannot save schedule: Doctor profile not available');
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
        availableDate: formData.availableDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: parseInt(formData.slotDuration),
        maxPatients: parseInt(formData.maxPatients),
      };

      if (editingSchedule) {
        // ✅ FIXED: Use update method directly
        await scheduleService.update(editingSchedule.id, scheduleData);
        enqueueSnackbar('Schedule updated successfully!', { variant: 'success' });
      } else {
        // ✅ FIXED: Use createMySchedule which automatically gets the correct doctor ID
        await scheduleService.createMySchedule(scheduleData);
        enqueueSnackbar('Schedule created successfully!', { variant: 'success' });
      }

      handleCloseDialog();
      loadDoctorProfileAndSchedules(); // Reload with correct doctor ID
    } catch (err) {
      console.error('Error saving schedule:', err);
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
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          Manage Schedule
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!doctorProfile || !doctorProfile.id}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            borderRadius: '12px',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add Time Slot
        </Button>
      </Box>

      {doctorProfile && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body1" fontWeight="bold">
            Managing schedule for: {doctorProfile.name}
            {doctorProfile.specialization && ` (${doctorProfile.specialization})`}
          </Typography>
          <Typography variant="body2">
            Doctor ID: {doctorProfile.id} | User: {user?.username}
          </Typography>
        </Alert>
      )}

      {!doctorProfile && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body1" fontWeight="bold">
            Doctor Profile Required
          </Typography>
          <Typography variant="body2">
            Please complete your doctor profile before managing schedules.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {schedules.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6, borderRadius: '20px' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
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
            disabled={!doctorProfile || !doctorProfile.id}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
              transition: 'all 0.3s ease'
            }}
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
                <Card sx={{ borderRadius: '20px' }}>
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
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(schedule)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            }
                          }}
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
                        sx={{ borderRadius: '8px' }}
                      />
                      <Chip
                        label={`${schedule.maxPatients} patients max`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ borderRadius: '8px' }}
                      />
                      <Chip
                        label={schedule.isBooked ? 'Booked' : 'Available'}
                        color={schedule.isBooked ? 'error' : 'success'}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </Box>

                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary' }}>
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
                          sx={{ borderRadius: '6px' }}
                        />
                      ))}
                      {timeSlots.length > 6 && (
                        <Chip
                          label={`+${timeSlots.length - 6} more`}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: '6px' }}
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
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
            {editingSchedule ? 'Edit Time Slot' : 'Add Time Slot'}
          </Typography>
          {doctorProfile && (
            <Typography variant="body2" color="textSecondary">
              For: {doctorProfile.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
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
                    sx={{
                      borderRadius: '12px',
                    }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !doctorProfile}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
              transition: 'all 0.3s ease'
            }}
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