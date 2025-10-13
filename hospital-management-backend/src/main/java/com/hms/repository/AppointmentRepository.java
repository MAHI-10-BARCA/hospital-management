package com.hms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments for a specific patient
    List<Appointment> findByPatientId(Long patientId);

    // Find appointments for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);
}