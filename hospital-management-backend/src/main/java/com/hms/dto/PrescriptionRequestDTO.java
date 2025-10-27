package com.hms.dto;

import java.time.LocalDate;
import java.util.List;

public class PrescriptionRequestDTO {
    private Long appointmentId;
    private String diagnosis;
    private String instructions;
    private LocalDate followUpDate;
    private List<MedicationDTO> medications;

    // Constructors
    public PrescriptionRequestDTO() {}

    public PrescriptionRequestDTO(Long appointmentId, String diagnosis, String instructions, LocalDate followUpDate, List<MedicationDTO> medications) {
        this.appointmentId = appointmentId;
        this.diagnosis = diagnosis;
        this.instructions = instructions;
        this.followUpDate = followUpDate;
        this.medications = medications;
    }

    // Getters and setters
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public List<MedicationDTO> getMedications() { return medications; }
    public void setMedications(List<MedicationDTO> medications) { this.medications = medications; }
}