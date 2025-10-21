import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  alpha,
} from '@mui/material';
import { 
  Description as DescriptionIcon, 
  CalendarToday, 
  Person, 
  LocalHospital 
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate } from '../../utils/helpers';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getMyPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      enqueueSnackbar('Failed to load prescriptions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription) => {
    console.log('View prescription:', prescription);
    alert(`Prescription Details:\nDiagnosis: ${prescription.diagnosis}\nInstructions: ${prescription.instructions}`);
  };

  if (loading) {
    return <Typography>Loading prescriptions...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        fontWeight="bold"
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        My Prescriptions
      </Typography>
      
      <Typography variant="subtitle1" sx={{ color: '#64748b', mb: 3, fontWeight: 500 }}>
        Your prescriptions from completed appointments
      </Typography>

      {prescriptions.length === 0 ? (
        <Card 
          sx={{ 
            textAlign: 'center', 
            p: 6,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '24px',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2, opacity: 0.7 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              mb: 1,
              fontWeight: 600,
            }}
          >
            No prescriptions found
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Your prescriptions will appear here after your appointments are completed by doctors.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {prescriptions.map((prescription) => (
            <Grid item xs={12} key={prescription.id}>
              <Card 
                sx={{ 
                  p: 3,
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
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                        Dr. {prescription.doctorName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {prescription.doctorSpecialization}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: '#475569', fontWeight: 500 }}>
                        <strong>Diagnosis:</strong> {prescription.diagnosis}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Completed" 
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: '600',
                      }}
                      size="small" 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" sx={{ color: '#64748b' }} />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        {formatDate(prescription.createdDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital fontSize="small" sx={{ color: '#64748b' }} />
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                        {prescription.hospitalName}
                      </Typography>
                    </Box>
                  </Box>

                  {prescription.medications && prescription.medications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
                        Medications ({prescription.medications.length})
                      </Typography>
                      {prescription.medications.slice(0, 2).map((med, index) => (
                        <Chip
                          key={index}
                          label={`${med.medicineName} - ${med.dosage}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            mr: 1, 
                            mb: 1,
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.1)',
                          }}
                        />
                      ))}
                      {prescription.medications.length > 2 && (
                        <Chip
                          label={`+${prescription.medications.length - 2} more`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            mb: 1,
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.1)',
                          }}
                        />
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleViewPrescription(prescription)}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c51e0 0%, #6d28d9 100%)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    View Full Prescription
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PatientPrescriptions;