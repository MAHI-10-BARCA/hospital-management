package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hms.entity.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(String status);
    
    // ✅ ADD THESE METHODS for role-based filtering
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
    List<Appointment> findByPatientIdAndStatus(Long patientId, String status);
    
    Optional<Appointment> findById(Long id);
    
    // ✅ ADD THIS: Find appointments by doctor user ID
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id IN " +
           "(SELECT d.id FROM Doctor d WHERE d.user.id = :doctorUserId)")
    List<Appointment> findByDoctorUserId(@Param("doctorUserId") Long doctorUserId);
}