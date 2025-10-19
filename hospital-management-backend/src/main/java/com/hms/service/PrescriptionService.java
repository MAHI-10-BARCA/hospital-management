package com.hms.service;

import com.hms.dto.*;
import com.hms.entity.*;
import com.hms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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