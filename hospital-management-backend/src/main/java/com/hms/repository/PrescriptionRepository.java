package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hms.entity.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    Optional<Prescription> findByAppointmentId(Long appointmentId);
    
    List<Prescription> findByAppointmentPatientId(Long patientId);
    
    List<Prescription> findByAppointmentDoctorId(Long doctorId);
    
    @Query("SELECT p FROM Prescription p WHERE p.appointment.patient.id = :patientId ORDER BY p.createdDate DESC")
    List<Prescription> findPrescriptionsByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT p FROM Prescription p WHERE p.appointment.doctor.id = :doctorId ORDER BY p.createdDate DESC")
    List<Prescription> findPrescriptionsByDoctorId(@Param("doctorId") Long doctorId);
    
    boolean existsByAppointmentId(Long appointmentId);
}