// pages/Prescription/PatientPrescriptions.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { DescriptionIcon, CalendarToday, Person, LocalHospital } from '@mui/icons-material';
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
    // Implement prescription detail view
    console.log('View prescription:', prescription);
    alert(`Prescription Details:\nDiagnosis: ${prescription.diagnosis}\nInstructions: ${prescription.instructions}`);
  };

  if (loading) {
    return <Typography>Loading prescriptions...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Prescriptions
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Your prescriptions from completed appointments
      </Typography>

      {prescriptions.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No prescriptions found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your prescriptions will appear here after your appointments are completed by doctors.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {prescriptions.map((prescription) => (
            <Grid item xs={12} key={prescription.id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Dr. {prescription.doctorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {prescription.doctorSpecialization}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Diagnosis:</strong> {prescription.diagnosis}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Completed" 
                      color="success" 
                      size="small" 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(prescription.createdDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital fontSize="small" color="action" />
                      <Typography variant="body2">
                        {prescription.hospitalName}
                      </Typography>
                    </Box>
                  </Box>

                  {prescription.medications && prescription.medications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Medications ({prescription.medications.length})
                      </Typography>
                      {prescription.medications.slice(0, 2).map((med, index) => (
                        <Chip
                          key={index}
                          label={`${med.medicineName} - ${med.dosage}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                      {prescription.medications.length > 2 && (
                        <Chip
                          label={`+${prescription.medications.length - 2} more`}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleViewPrescription(prescription)}
                  >
                    View Full Prescription
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PatientPrescriptions;
