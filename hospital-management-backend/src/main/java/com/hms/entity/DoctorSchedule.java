package com.hms.entity;

import java.time.LocalDate;
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
@Table(name = "doctor_schedule")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DoctorSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "available_date")
    private LocalDate availableDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_booked", columnDefinition = "boolean default false")
    private Boolean isBooked = false;

    @Column(name = "created_by")
    private String createdBy; // "DOCTOR" or "ADMIN"

    @Column(name = "slot_duration")
    private Integer slotDuration = 30; // Default 30 minutes

    @Column(name = "max_patients")
    private Integer maxPatients = 3; // Default 3 patients per slot

    @Column(name = "current_bookings", nullable = false, columnDefinition = "integer default 0")
    private Integer currentBookings = 0; // ✅ FIXED: Added nullable=false and default

    // Constructors
    public DoctorSchedule() {
        this.isBooked = false;
        this.currentBookings = 0; // ✅ FIXED: Ensure default in constructor
        this.maxPatients = 3;
    }

    public DoctorSchedule(Doctor doctor, LocalDate availableDate, LocalTime startTime, LocalTime endTime, String createdBy) {
        this();
        this.doctor = doctor;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
    }

    // Updated constructor with new fields
    public DoctorSchedule(Doctor doctor, LocalDate availableDate, LocalTime startTime, LocalTime endTime, String createdBy, Integer slotDuration, Integer maxPatients) {
        this();
        this.doctor = doctor;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
        this.slotDuration = slotDuration;
        this.maxPatients = maxPatients;
    }

    // ✅ ADDED: Method to check if schedule is available
    public boolean isAvailable() {
        return !isBooked && currentBookings < maxPatients;
    }

    // ✅ ADDED: Method to book a slot
    public void bookSlot() {
        if (this.currentBookings == null) {
            this.currentBookings = 0; // ✅ FIXED: Handle null case
        }
        this.currentBookings++;
        System.out.println("📊 Slot booked - Current bookings: " + currentBookings + "/" + maxPatients);
        if (this.currentBookings >= this.maxPatients) {
            this.isBooked = true;
            System.out.println("🚫 Slot is now fully booked");
        }
    }

    // ✅ ADDED: Method to cancel a booking
    public void cancelBooking() {
        if (this.currentBookings == null) {
            this.currentBookings = 0; // ✅ FIXED: Handle null case
        }
        if (this.currentBookings > 0) {
            this.currentBookings--;
            System.out.println("📊 Booking cancelled - Current bookings: " + currentBookings + "/" + maxPatients);
        }
        if (this.currentBookings < this.maxPatients) {
            this.isBooked = false;
            System.out.println("✅ Slot is now available again");
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    
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
    
    public Integer getCurrentBookings() { 
        if (currentBookings == null) {
            currentBookings = 0; // ✅ FIXED: Handle null in getter
        }
        return currentBookings; 
    }
    public void setCurrentBookings(Integer currentBookings) { 
        this.currentBookings = currentBookings; 
    }

    @Override
    public String toString() {
        return "DoctorSchedule{" +
                "id=" + id +
                ", availableDate=" + availableDate +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", isBooked=" + isBooked +
                ", maxPatients=" + maxPatients +
                ", currentBookings=" + getCurrentBookings() + // ✅ FIXED: Use getter to handle null
                '}';
    }
}