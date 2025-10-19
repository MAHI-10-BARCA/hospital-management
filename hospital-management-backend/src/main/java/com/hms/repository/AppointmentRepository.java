package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hms.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);
    
    List<Appointment> findByDoctorId(Long doctorId);
    
    List<Appointment> findByScheduleId(Long scheduleId);
    
    // Add these methods for authorization checks
    Optional<Appointment> findByIdAndPatientId(Long id, Long patientId);
    
    Optional<Appointment> findByIdAndDoctorId(Long id, Long doctorId);
    
    // Find appointments by status
    List<Appointment> findByStatus(String status);
    
    // Find appointments by doctor and status
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
    
    // Find appointments by patient and status
    List<Appointment> findByPatientIdAndStatus(Long patientId, String status);
    
    // Custom query to find appointments with details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor JOIN FETCH a.schedule WHERE a.id = :id")
    Optional<Appointment> findByIdWithDetails(@Param("id") Long id);
}