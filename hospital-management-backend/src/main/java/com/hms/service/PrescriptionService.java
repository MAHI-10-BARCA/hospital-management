package com.hms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.dto.MedicationDTO;
import com.hms.dto.PrescriptionRequestDTO;
import com.hms.dto.PrescriptionResponseDTO;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Medication;
import com.hms.entity.Patient;
import com.hms.entity.Prescription;
import com.hms.entity.User;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.MedicationRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.PrescriptionRepository;
import com.hms.repository.UserRepository;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    public Prescription createPrescription(PrescriptionRequestDTO requestDTO, String username) {
        System.out.println("💊 Creating prescription for appointment: " + requestDTO.getAppointmentId());
        
        Appointment appointment = appointmentRepository.findById(requestDTO.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if doctor owns this appointment
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("You can only create prescriptions for your own appointments");
        }

        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setDiagnosis(requestDTO.getDiagnosis());
        prescription.setInstructions(requestDTO.getInstructions());
        prescription.setFollowUpDate(requestDTO.getFollowUpDate());

        // Save prescription first
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Save medications
        if (requestDTO.getMedications() != null) {
            for (MedicationDTO medDTO : requestDTO.getMedications()) {
                if (medDTO.getMedicineName() != null && !medDTO.getMedicineName().trim().isEmpty()) {
                    Medication medication = new Medication();
                    medication.setPrescription(savedPrescription);
                    medication.setMedicineName(medDTO.getMedicineName());
                    medication.setDosage(medDTO.getDosage());
                    medication.setFrequency(medDTO.getFrequency());
                    medication.setDuration(medDTO.getDuration());
                    medication.setNotes(medDTO.getNotes());
                    medicationRepository.save(medication);
                }
            }
        }

        System.out.println("✅ Prescription created with ID: " + savedPrescription.getId());
        return savedPrescription;
    }

    public PrescriptionResponseDTO getPrescriptionByAppointment(Long appointmentId) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        return convertToDTO(prescription);
    }

    // ✅ ADDED: Get prescription for patient (with security check)
    public PrescriptionResponseDTO getPrescriptionForPatient(Long prescriptionId, String username) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        // Check if the current user is the patient of this prescription
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        if (!prescription.getAppointment().getPatient().getId().equals(patient.getId())) {
            throw new RuntimeException("You can only view your own prescriptions");
        }

        // Check if appointment is completed
        if (!"COMPLETED".equals(prescription.getAppointment().getStatus())) {
            throw new RuntimeException("Prescription is not available until appointment is completed");
        }

        return convertToDTO(prescription);
    }

    // ✅ ADDED: Get all prescriptions for current patient
    public List<PrescriptionResponseDTO> getPatientPrescriptions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        // Get prescriptions only for completed appointments
        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentPatientIdAndAppointmentStatus(
            patient.getId(), "COMPLETED");
        
        return prescriptions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ ADDED: Get prescription by appointment ID for patient
    public PrescriptionResponseDTO getPrescriptionByAppointmentForPatient(Long appointmentId, String username) {
        System.out.println("🔍 Looking for prescription for appointment: " + appointmentId + " for patient: " + username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        System.out.println("👤 Patient found: " + patient.getName() + " (ID: " + patient.getId() + ")");

        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> {
                    System.out.println("❌ No prescription found for appointment: " + appointmentId);
                    return new RuntimeException("Prescription not found");
                });

        System.out.println("📄 Prescription found for appointment: " + appointmentId);
        System.out.println("🔒 Checking authorization...");

        // Security check - patient can only view their own prescriptions
        if (!prescription.getAppointment().getPatient().getId().equals(patient.getId())) {
            System.out.println("🚫 Authorization failed: Patient " + patient.getId() + " trying to access prescription for patient " + prescription.getAppointment().getPatient().getId());
            throw new RuntimeException("You can only view your own prescriptions");
        }

        // Check if appointment is completed
        if (!"COMPLETED".equals(prescription.getAppointment().getStatus())) {
            System.out.println("⏳ Prescription not available - Appointment status: " + prescription.getAppointment().getStatus());
            throw new RuntimeException("Prescription is not available until appointment is completed");
        }

        System.out.println("✅ Authorization successful, returning prescription");
        return convertToDTO(prescription);
    }

    public List<PrescriptionResponseDTO> getPrescriptionsForPatient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentPatientId(patient.getId());
        return prescriptions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponseDTO> getPrescriptionsForDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentDoctorId(doctor.getId());
        return prescriptions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    

    public Prescription updatePrescription(Long id, PrescriptionRequestDTO requestDTO, String username) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        // Authorization check
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (!prescription.getAppointment().getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("You can only update your own prescriptions");
        }

        prescription.setDiagnosis(requestDTO.getDiagnosis());
        prescription.setInstructions(requestDTO.getInstructions());
        prescription.setFollowUpDate(requestDTO.getFollowUpDate());
        prescription.setUpdatedDate(LocalDateTime.now());

        // Update medications
        medicationRepository.deleteByPrescriptionId(prescription.getId());
        
        if (requestDTO.getMedications() != null) {
            for (MedicationDTO medDTO : requestDTO.getMedications()) {
                if (medDTO.getMedicineName() != null && !medDTO.getMedicineName().trim().isEmpty()) {
                    Medication medication = new Medication();
                    medication.setPrescription(prescription);
                    medication.setMedicineName(medDTO.getMedicineName());
                    medication.setDosage(medDTO.getDosage());
                    medication.setFrequency(medDTO.getFrequency());
                    medication.setDuration(medDTO.getDuration());
                    medication.setNotes(medDTO.getNotes());
                    medicationRepository.save(medication);
                }
            }
        }

        return prescriptionRepository.save(prescription);
    }

    public void deletePrescription(Long id, String username) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        // Authorization check
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (!prescription.getAppointment().getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("You can only delete your own prescriptions");
        }

        prescriptionRepository.delete(prescription);
        System.out.println("🗑️ Prescription deleted: " + id);
    }

    private PrescriptionResponseDTO convertToDTO(Prescription prescription) {
        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setId(prescription.getId());
        
        Appointment appointment = prescription.getAppointment();
        dto.setAppointmentId(appointment.getId());
        
        // Patient details
        if (appointment.getPatient() != null) {
            dto.setPatientName(appointment.getPatient().getName());
            dto.setPatientAge(String.valueOf(appointment.getPatient().getAge()));
            dto.setPatientGender(appointment.getPatient().getGender());
        }
        
        // Doctor details
        if (appointment.getDoctor() != null) {
            dto.setDoctorName(appointment.getDoctor().getName());
            dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        }
        
        dto.setHospitalName(prescription.getHospitalName());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setInstructions(prescription.getInstructions());
        dto.setFollowUpDate(prescription.getFollowUpDate());
        dto.setCreatedDate(prescription.getCreatedDate());
        
        // Medications
        if (prescription.getMedications() != null) {
            List<MedicationDTO> medicationDTOs = prescription.getMedications().stream()
                    .map(this::convertMedicationToDTO)
                    .collect(Collectors.toList());
            dto.setMedications(medicationDTOs);
        }
        
        return dto;
    }

    private MedicationDTO convertMedicationToDTO(Medication medication) {
        MedicationDTO dto = new MedicationDTO();
        dto.setId(medication.getId());
        dto.setMedicineName(medication.getMedicineName());
        dto.setDosage(medication.getDosage());
        dto.setFrequency(medication.getFrequency());
        dto.setDuration(medication.getDuration());
        dto.setNotes(medication.getNotes());
        return dto;
    }
}