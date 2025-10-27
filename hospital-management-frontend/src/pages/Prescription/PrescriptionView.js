import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';

const PrescriptionView = ({ open, onClose, prescription, appointment }) => {
  if (!prescription) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
            Medical Prescription
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Hospital Header */}
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
          }}
        >
          <CardContent>
            <Typography variant="h5" align="center" fontWeight="bold" sx={{ color: '#6366f1' }}>
              🏥 {prescription.hospitalName || 'CITY GENERAL HOSPITAL'}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#64748b', fontWeight: 500 }}>
              Quality Healthcare Services
            </Typography>
          </CardContent>
        </Card>

        {/* Patient and Doctor Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>PATIENT DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#1e293b' }}>
              <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#6366f1' }} />
              {prescription.patientName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              Age: {prescription.patientAge} • Gender: {prescription.patientGender}
            </Typography>
            {appointment && (
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                Appointment: {formatDate(appointment.appointmentDate)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>DOCTOR DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#1e293b' }}>
              Dr. {prescription.doctorName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>{prescription.doctorSpecialization}</Typography>
            <Chip 
              label="Consultant" 
              size="small" 
              sx={{
                mt: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: '600',
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

        {/* Diagnosis */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
            Diagnosis
          </Typography>
          <Card 
            variant="outlined"
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                {prescription.diagnosis || 'No diagnosis provided'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
            Doctor's Instructions
          </Typography>
          <Card 
            variant="outlined"
            sx={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                {prescription.instructions || 'No specific instructions provided'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Medications */}
        {prescription.medications && prescription.medications.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
              💊 Medications
            </Typography>
            {prescription.medications.map((medication, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 2, 
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                      {medication.medicineName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Dosage: {medication.dosage || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Frequency: {medication.frequency || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      Duration: {medication.duration || 'Not specified'}
                    </Typography>
                    {medication.notes && (
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Notes: {medication.notes}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        )}

        {/* Follow-up Date */}
        {prescription.followUpDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
              Follow-up Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: '#64748b' }} />
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                {formatDate(prescription.followUpDate)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Prescription Date */}
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
          Prescription created: {formatDate(prescription.createdDate)}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            border: '2px solid rgba(99, 102, 241, 0.2)',
            color: '#6366f1',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            '&:hover': {
              border: '2px solid rgba(99, 102, 241, 0.4)',
              background: 'rgba(99, 102, 241, 0.08)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={() => window.print()}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c51e0 0%, #6d28d9 100%)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Print Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionView;