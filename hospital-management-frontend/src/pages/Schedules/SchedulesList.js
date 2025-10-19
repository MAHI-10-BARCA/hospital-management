import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/scheduleService';
import { hasPermission } from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { formatDate, formatTime } from '../../utils/helpers';

const SchedulesList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (hasPermission(user, 'manage_schedules')) {
        // Doctor viewing their own schedules
        console.log('🔄 Loading doctor schedules for user:', user.id);
        try {
          // Try the new endpoint first
          data = await scheduleService.getDoctorOwnSchedules(user.id);
        } catch (err) {
          console.warn('❌ Doctor schedules endpoint failed, trying fallback:', err);
          // Fallback to available schedules
          data = await scheduleService.getAvailableByDoctor(user.id);
        }
      } else if (hasPermission(user, 'manage_patients')) {
        // Admin viewing all schedules - need to implement this endpoint
        console.log('👑 Admin viewing schedules');
        // For now, show message that admin can view but not manage
        data = [];
      } else {
        // Patient or other users - show available schedules
        console.log('👤 Patient viewing available schedules');
        data = [];
      }
      
      console.log('📅 Schedules loaded:', data);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading schedules:', err);
      setError('Failed to load schedules: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await scheduleService.delete(scheduleToDelete.id);
      setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
    } catch (err) {
      console.error('❌ Error deleting schedule:', err);
      setError('Failed to delete schedule: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleEditClick = (schedule) => {
    // Navigate to manage schedule with edit mode
    navigate('/schedules/manage', { state: { editSchedule: schedule } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {hasPermission(user, 'manage_schedules') ? 'My Schedule' : 'Doctor Schedules'}
        </Typography>
        {hasPermission(user, 'manage_schedules') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/schedules/manage')}
            sx={{ borderRadius: 2 }}
          >
            Add Time Slot
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Info for different user roles */}
      {hasPermission(user, 'manage_patients') && schedules.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Admin View:</strong> You can view all appointments in the Appointments section. 
            Doctors manage their own schedules.
          </Typography>
        </Alert>
      )}

      {!hasPermission(user, 'manage_schedules') && !hasPermission(user, 'manage_patients') && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Patient View:</strong> Available time slots are shown when booking appointments.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {schedules.map((schedule) => (
          <Grid item xs={12} md={6} lg={4} key={schedule.id}>
            <Card 
              sx={{ 
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatDate(schedule.availableDate)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Action buttons for doctors */}
                  {hasPermission(user, 'manage_schedules') && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(schedule)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(schedule)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={schedule.isBooked ? 'Booked' : 'Available'}
                    color={schedule.isBooked ? 'error' : 'success'}
                    size="small"
                  />
                  {schedule.createdBy && (
                    <Chip
                      label={`By: ${schedule.createdBy}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {schedule.slotDuration && (
                    <Chip
                      label={`${schedule.slotDuration}min`}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>

                {/* Doctor info (for admin view) */}
                {hasPermission(user, 'manage_patients') && schedule.doctor && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Doctor: Dr. {schedule.doctor.name || schedule.doctor.username}
                    {schedule.doctor.specialization && ` • ${schedule.doctor.specialization}`}
                  </Typography>
                )}

                {/* Additional info */}
                <Box sx={{ mt: 1 }}>
                  {schedule.maxPatients && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Max patients: {schedule.maxPatients}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {schedules.length === 0 && (
        <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No schedules found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {hasPermission(user, 'manage_schedules') 
              ? 'Add your available time slots to allow patients to book appointments with you.'
              : hasPermission(user, 'manage_patients')
              ? 'Doctors will appear here once they add their schedules.'
              : 'Check back later for available appointment slots.'
            }
          </Typography>
          {hasPermission(user, 'manage_schedules') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/schedules/manage')}
            >
              Add Your First Time Slot
            </Button>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Time Slot"
        message="Are you sure you want to delete this time slot? Any associated appointments will be cancelled."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default SchedulesList;