package com.hms.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleRequestDTO {
    private Long doctorId;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration; // Add this
    private Integer maxPatients;  // Add this

    // Constructors
    public ScheduleRequestDTO() {}

    public ScheduleRequestDTO(Long doctorId, LocalDate availableDate, LocalTime startTime, LocalTime endTime, Integer slotDuration, Integer maxPatients) {
        this.doctorId = doctorId;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotDuration = slotDuration;
        this.maxPatients = maxPatients;
    }

    // Getters and Setters
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    
    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    
    public Integer getSlotDuration() { return slotDuration; }
    public void setSlotDuration(Integer slotDuration) { this.slotDuration = slotDuration; }
    
    public Integer getMaxPatients() { return maxPatients; }
    public void setMaxPatients(Integer maxPatients) { this.maxPatients = maxPatients; }
}