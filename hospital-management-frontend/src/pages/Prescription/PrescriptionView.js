// components/Prescription/PrescriptionView.js
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Medical Prescription
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Hospital Header */}
        <Card sx={{ mb: 3, backgroundColor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h5" align="center" fontWeight="bold" color="primary">
              🏥 {prescription.hospitalName || 'CITY GENERAL HOSPITAL'}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Quality Healthcare Services
            </Typography>
          </CardContent>
        </Card>

        {/* Patient and Doctor Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">PATIENT DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold">
              <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
              {prescription.patientName}
            </Typography>
            <Typography variant="body2">
              Age: {prescription.patientAge} • Gender: {prescription.patientGender}
            </Typography>
            {appointment && (
              <Typography variant="body2">
                Appointment: {formatDate(appointment.appointmentDate)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">DOCTOR DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold">
              Dr. {prescription.doctorName}
            </Typography>
            <Typography variant="body2">{prescription.doctorSpecialization}</Typography>
            <Chip label="Consultant" size="small" color="primary" sx={{ mt: 1 }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Diagnosis */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Diagnosis
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1">
                {prescription.diagnosis || 'No diagnosis provided'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Doctor's Instructions
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1">
                {prescription.instructions || 'No specific instructions provided'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Medications */}
        {prescription.medications && prescription.medications.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              💊 Medications
            </Typography>
            {prescription.medications.map((medication, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="bold">
                      {medication.medicineName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dosage: {medication.dosage || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Frequency: {medication.frequency || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      Duration: {medication.duration || 'Not specified'}
                    </Typography>
                    {medication.notes && (
                      <Typography variant="body2" color="text.secondary">
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
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Follow-up Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="action" />
              <Typography variant="body1">
                {formatDate(prescription.followUpDate)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Prescription Date */}
        <Typography variant="caption" color="text.secondary">
          Prescription created: {formatDate(prescription.createdDate)}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          onClick={() => window.print()}
        >
          Print Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionView;