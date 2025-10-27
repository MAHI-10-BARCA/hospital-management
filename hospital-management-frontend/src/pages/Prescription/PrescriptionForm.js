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
  alpha,
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
      
      onClose(true);
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

  const patientName = appointment.patientName || 'N/A';
  const patientAge = appointment.patientAge || 'N/A';
  const patientGender = appointment.patientGender || 'N/A';
  const doctorName = appointment.doctorName || 'N/A';
  const doctorSpecialization = appointment.doctorSpecialization || 'N/A';
  const appointmentDate = appointment.appointmentDate ? formatDate(appointment.appointmentDate) : 'N/A';

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)} 
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
          <HospitalIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
            {isEdit ? 'Edit Prescription' : 'Create Prescription'}
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
              🏥 CITY GENERAL HOSPITAL
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
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#1e293b' }}>{patientName}</Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              Age: {patientAge} • Gender: {patientGender}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              Appointment: {appointmentDate}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>DOCTOR DETAILS</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#1e293b' }}>Dr. {doctorName}</Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>{doctorSpecialization}</Typography>
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
        <TextField
          fullWidth
          label="Diagnosis *"
          multiline
          rows={3}
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          sx={{ mb: 3 }}
          placeholder="Enter patient diagnosis and symptoms..."
          InputProps={{
            sx: {
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }
          }}
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
          InputProps={{
            sx: {
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }
          }}
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
          InputProps={{
            sx: {
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }
          }}
        />

        {/* Medications Section */}
        <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
          💊 Medications
        </Typography>

        {formData.medications.map((medication, index) => (
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  value={medication.medicineName}
                  onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                  size="small"
                  InputProps={{
                    sx: {
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
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
                  InputProps={{
                    sx: {
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
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
                  InputProps={{
                    sx: {
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
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
                  InputProps={{
                    sx: {
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={medication.notes}
                  onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                  size="small"
                  InputProps={{
                    sx: {
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  onClick={() => removeMedication(index)}
                  sx={{ color: '#ef4444' }}
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
          sx={{ 
            mb: 3,
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
          Add Medication
        </Button>
      </DialogContent>

      <DialogActions>
        {isEdit && (
          <Button 
            onClick={handleDelete} 
            sx={{ color: '#ef4444' }}
            disabled={loading}
          >
            Delete Prescription
          </Button>
        )}
        <Button 
          onClick={() => onClose(false)} 
          disabled={loading}
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
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.diagnosis.trim()}
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
          {loading ? 'Saving...' : (isEdit ? 'Update Prescription' : 'Save Prescription')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionForm;