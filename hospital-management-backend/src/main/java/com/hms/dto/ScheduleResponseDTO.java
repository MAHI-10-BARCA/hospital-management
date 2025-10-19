package com.hms.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleResponseDTO {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isBooked;
    private String createdBy;
    private Integer slotDuration;
    private Integer maxPatients;

    // Constructors
    public ScheduleResponseDTO() {}

    public ScheduleResponseDTO(Long id, Long doctorId, String doctorName, String specialization, 
                              LocalDate availableDate, LocalTime startTime, LocalTime endTime, 
                              Boolean isBooked, String createdBy, Integer slotDuration, Integer maxPatients) {
        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = isBooked;
        this.createdBy = createdBy;
        this.slotDuration = slotDuration;
        this.maxPatients = maxPatients;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Boolean getIsBooked() { return isBooked; }
    public void setIsBooked(Boolean isBooked) { this.isBooked = isBooked; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Integer getSlotDuration() { return slotDuration; }
    public void setSlotDuration(Integer slotDuration) { this.slotDuration = slotDuration; }

    public Integer getMaxPatients() { return maxPatients; }
    public void setMaxPatients(Integer maxPatients) { this.maxPatients = maxPatients; }
}