package com.hms.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "appointment")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private DoctorSchedule schedule;

    private String status;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "appointment_time")
    private LocalTime appointmentTime;

    // Constructors
    public Appointment() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "SCHEDULED";
    }

    public Appointment(Patient patient, Doctor doctor, DoctorSchedule schedule, String reason) {
        this();
        this.patient = patient;
        this.doctor = doctor;
        this.schedule = schedule;
        this.reason = reason;
        
        if (schedule != null) {
            this.appointmentDate = schedule.getAvailableDate();
            this.appointmentTime = schedule.getStartTime();
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { 
        this.patient = patient;
        this.updatedDate = LocalDateTime.now();
    }
    
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { 
        this.doctor = doctor;
        this.updatedDate = LocalDateTime.now();
    }
    
    public DoctorSchedule getSchedule() { return schedule; }
    public void setSchedule(DoctorSchedule schedule) { 
        this.schedule = schedule;
        if (schedule != null) {
            this.appointmentDate = schedule.getAvailableDate();
            this.appointmentTime = schedule.getStartTime();
        }
        this.updatedDate = LocalDateTime.now();
    }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status;
        this.updatedDate = LocalDateTime.now();
    }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { 
        this.reason = reason;
        this.updatedDate = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public LocalDate getAppointmentDate() { 
        if (appointmentDate != null) {
            return appointmentDate;
        }
        return schedule != null ? schedule.getAvailableDate() : null;
    }
    
    public void setAppointmentDate(LocalDate appointmentDate) { 
        this.appointmentDate = appointmentDate;
        this.updatedDate = LocalDateTime.now();
    }
    
    public LocalTime getAppointmentTime() { 
        if (appointmentTime != null) {
            return appointmentTime;
        }
        return schedule != null ? schedule.getStartTime() : null;
    }
    
    public void setAppointmentTime(LocalTime appointmentTime) { 
        this.appointmentTime = appointmentTime;
        this.updatedDate = LocalDateTime.now();
    }

    // Helper methods for formatted dates
    public String getFormattedAppointmentDate() {
        LocalDate date = getAppointmentDate();
        return date != null ? date.toString() : "Not scheduled";
    }

    public String getFormattedAppointmentTime() {
        LocalTime time = getAppointmentTime();
        return time != null ? time.toString() : "Not scheduled";
    }

    public String getFormattedCreatedDate() {
        return createdDate != null ? createdDate.toString() : "Unknown";
    }
    
    @Override
    public String toString() {
        return "Appointment{" +
                "id=" + id +
                ", patient=" + (patient != null ? patient.getName() : "null") +
                ", doctor=" + (doctor != null ? doctor.getName() : "null") +
                ", status='" + status + '\'' +
                ", reason='" + reason + '\'' +
                ", date=" + getFormattedAppointmentDate() +
                ", time=" + getFormattedAppointmentTime() +
                '}';
    }
}