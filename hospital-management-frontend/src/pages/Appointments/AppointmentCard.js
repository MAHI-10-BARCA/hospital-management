import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  alpha,
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
    <Card 
      sx={{ 
        mb: 2, 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
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
          background: isCompleted 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
              {appointment.patientName} with Dr. {appointment.doctorName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HospitalIcon fontSize="small" />
              {appointment.doctorSpecialization}
            </Typography>
          </Box>
          <Chip 
            label={appointment.status} 
            sx={{
              background: appointment.status === 'COMPLETED' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : appointment.status === 'SCHEDULED'
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontWeight: '600',
            }}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateIcon sx={{ color: '#64748b' }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Date</Typography>
              <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>{formatDate(appointment.appointmentDate)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ color: '#64748b' }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Time</Typography>
              <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                {formatTime(appointment.appointmentTime)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>Reason</Typography>
          <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>{appointment.reason || 'Regular checkup'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Created: {formatDateTime(appointment.createdDate)}
          </Typography>

          {isCompleted && hasPrescription && userRole === 'PATIENT' && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onViewPrescription(appointment)}
              sx={{
                border: '2px solid rgba(99, 102, 241, 0.2)',
                color: '#6366f1',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': {
                  border: '2px solid rgba(99, 102, 241, 0.4)',
                  background: 'rgba(99, 102, 241, 0.08)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View Prescription
            </Button>
          )}

          {userRole === 'DOCTOR' && isCompleted && (
            <Button 
              variant="contained" 
              size="small"
              onClick={() => onViewPrescription(appointment)}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0da271 0%, #047852 100%)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
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