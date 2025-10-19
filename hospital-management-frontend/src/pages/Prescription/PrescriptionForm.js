// components/Prescription/PrescriptionForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate } from '../../utils/helpers';

const PrescriptionForm = ({ open, onClose, appointment, prescription: existingPrescription }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    instructions: '',
    followUpDate: '',
    medications: [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (existingPrescription) {
      setIsEdit(true);
      setFormData({
        diagnosis: existingPrescription.diagnosis || '',
        instructions: existingPrescription.instructions || '',
        followUpDate: existingPrescription.followUpDate || '',
        medications: existingPrescription.medications?.length > 0 
          ? existingPrescription.medications 
          : [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]
      });
    } else {
      setIsEdit(false);
      setFormData({
        diagnosis: '',
        instructions: '',
        followUpDate: '',
        medications: [{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]
      });
    }
  }, [existingPrescription, open]);

  // ✅ ADDED: Early return if appointment is null
  if (!appointment) {
    return null;
  }

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData({ ...formData, medications: updatedMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }
      ]
    });
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({ ...formData, medications: updatedMedications });
    }
  };

  const handleSubmit = async () => {
    if (!formData.diagnosis.trim()) {
      enqueueSnackbar('Please enter a diagnosis', { variant: 'warning' });
      return;
    }

    // ✅ ADDED: Check if appointment exists
    if (!appointment || !appointment.id) {
      enqueueSnackbar('Invalid appointment data', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const prescriptionData = {
        appointmentId: appointment.id,
        diagnosis: formData.diagnosis,
        instructions: formData.instructions,
        followUpDate: formData.followUpDate || null,
        medications: formData.medications.filter(med => med.medicineName.trim() !== '')
      };

      if (isEdit) {
        await prescriptionService.update(existingPrescription.id, prescriptionData);
        enqueueSnackbar('Prescription updated successfully', { variant: 'success' });
      } else {
        await prescriptionService.create(prescriptionData);
        enqueueSnackbar('Prescription created successfully', { variant: 'success' });
      }
      
      onClose(true); // Refresh appointments list
    } catch (error) {
      console.error('Error saving prescription:', error);
      enqueueSnackbar('Failed to save prescription', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPrescription) return;
    
    setLoading(true);
    try {
      await prescriptionService.delete(existingPrescription.id);
      enqueueSnackbar('Prescription deleted successfully', { variant: 'success' });
      onClose(true);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      enqueueSnackbar('Failed to delete prescription', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Safe data access with fallbacks
  const patientName = appointment.patientName || 'N/A';
  const patientAge = appointment.patientAge || 'N/A';
  const patientGender = appointment.patientGender || 'N/A';
  const doctorName = appointment.doctorName || 'N/A';
  const doctorSpecialization = appointment.doctorSpecialization || 'N/A';
  const appointmentDate = appointment.appointmentDate ? formatDate(appointment.appointmentDate) : 'N/A';

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HospitalIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Prescription' : 'Create Prescription'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Hospital Header */}
        <Card sx={{ mb: 3, backgroundColor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h5" align="center" fontWeight="bold" color="primary">
              🏥 CITY GENERAL HOSPITAL
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
            <Typography variant="body1" fontWeight="bold">{patientName}</Typography>
            <Typography variant="body2">
              Age: {patientAge} • Gender: {patientGender}
            </Typography>
            <Typography variant="body2">
              Appointment: {appointmentDate}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">DOCTOR DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold">Dr. {doctorName}</Typography>
            <Typography variant="body2">{doctorSpecialization}</Typography>
            <Chip label="Consultant" size="small" color="primary" sx={{ mt: 1 }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Diagnosis */}
        <TextField
          fullWidth
          label="Diagnosis *"
          multiline
          rows={3}
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          sx={{ mb: 3 }}
          placeholder="Enter patient diagnosis and symptoms..."
        />

        {/* Instructions */}
        <TextField
          fullWidth
          label="Doctor's Instructions"
          multiline
          rows={3}
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          sx={{ mb: 3 }}
          placeholder="Enter instructions for the patient..."
        />

        {/* Follow-up Date */}
        <TextField
          fullWidth
          label="Follow-up Date"
          type="date"
          value={formData.followUpDate}
          onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        {/* Medications Section */}
        <Typography variant="h6" gutterBottom>
          💊 Medications
        </Typography>

        {formData.medications.map((medication, index) => (
          <Card key={index} sx={{ mb: 2, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  value={medication.medicineName}
                  onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  size="small"
                  placeholder="e.g., 500mg"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  size="small"
                  placeholder="e.g., 2 times daily"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  size="small"
                  placeholder="e.g., 7 days"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={medication.notes}
                  onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  onClick={() => removeMedication(index)}
                  color="error"
                  disabled={formData.medications.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Card>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addMedication}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Add Medication
        </Button>
      </DialogContent>

      <DialogActions>
        {isEdit && (
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Delete Prescription
          </Button>
        )}
        <Button onClick={() => onClose(false)} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.diagnosis.trim()}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Prescription' : 'Save Prescription')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionForm;