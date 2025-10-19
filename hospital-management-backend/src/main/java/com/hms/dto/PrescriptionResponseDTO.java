package com.hms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PrescriptionResponseDTO {
    private Long id;
    private Long appointmentId;
    private String patientName;
    private String patientAge;
    private String patientGender;
    private String doctorName;
    private String doctorSpecialization;
    private String hospitalName;
    private String diagnosis;
    private String instructions;
    private LocalDate followUpDate;
    private LocalDateTime createdDate;
    private List<MedicationDTO> medications;

    // Constructors
    public PrescriptionResponseDTO() {}

    public PrescriptionResponseDTO(Long id, Long appointmentId, String patientName, String patientAge, 
                                  String patientGender, String doctorName, String doctorSpecialization,
                                  String hospitalName, String diagnosis, String instructions, 
                                  LocalDate followUpDate, LocalDateTime createdDate, List<MedicationDTO> medications) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.patientName = patientName;
        this.patientAge = patientAge;
        this.patientGender = patientGender;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.hospitalName = hospitalName;
        this.diagnosis = diagnosis;
        this.instructions = instructions;
        this.followUpDate = followUpDate;
        this.createdDate = createdDate;
        this.medications = medications;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientAge() { return patientAge; }
    public void setPatientAge(String patientAge) { this.patientAge = patientAge; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorSpecialization() { return doctorSpecialization; }
    public void setDoctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public List<MedicationDTO> getMedications() { return medications; }
    public void setMedications(List<MedicationDTO> medications) { this.medications = medications; }
}