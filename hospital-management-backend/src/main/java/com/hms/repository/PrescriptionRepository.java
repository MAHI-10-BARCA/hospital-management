package com.hms.repository; // ✅ Make sure it's in repository package, not controller

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
    
    @Query("SELECT p FROM Prescription p WHERE p.appointment.patient.id = :patientId AND p.appointment.status = :status")
    List<Prescription> findByAppointmentPatientIdAndAppointmentStatus(@Param("patientId") Long patientId, @Param("status") String status);
    
    @Query("SELECT p FROM Prescription p WHERE p.appointment.id = :appointmentId AND p.appointment.patient.id = :patientId")
    Optional<Prescription> findByAppointmentIdAndAppointmentPatientId(@Param("appointmentId") Long appointmentId, @Param("patientId") Long patientId);
}