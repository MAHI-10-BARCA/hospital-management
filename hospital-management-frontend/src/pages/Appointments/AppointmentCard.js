// components/Appointment/AppointmentCard.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { formatDate, formatTime, formatDateTime } from '../../utils/helpers';

const AppointmentCard = ({ appointment, onViewPrescription, userRole }) => {
  const isCompleted = appointment.status === 'COMPLETED';
  const hasPrescription = appointment.prescriptionId != null;

  return (
    <Card sx={{ mb: 2, borderLeft: isCompleted ? '4px solid #4CAF50' : '4px solid #2196F3' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {appointment.patientName} with Dr. {appointment.doctorName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HospitalIcon fontSize="small" />
              {appointment.doctorSpecialization}
            </Typography>
          </Box>
          <Chip 
            label={appointment.status} 
            color={
              appointment.status === 'COMPLETED' ? 'success' :
              appointment.status === 'SCHEDULED' ? 'primary' :
              appointment.status === 'CANCELLED' ? 'error' : 'default'
            }
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography variant="body2">{formatDate(appointment.appointmentDate)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Time</Typography>
              <Typography variant="body2">
                {formatTime(appointment.appointmentTime)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Reason</Typography>
          <Typography variant="body2">{appointment.reason || 'Regular checkup'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {formatDateTime(appointment.createdDate)}
          </Typography>

          {/* Show View Prescription button for completed appointments */}
          {isCompleted && hasPrescription && userRole === 'PATIENT' && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onViewPrescription(appointment)}
            >
              View Prescription
            </Button>
          )}

          {/* Show Create/View Prescription for doctors */}
          {userRole === 'DOCTOR' && isCompleted && (
            <Button 
              variant="contained" 
              size="small"
              onClick={() => onViewPrescription(appointment)}
            >
              {hasPrescription ? 'View Prescription' : 'Create Prescription'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;