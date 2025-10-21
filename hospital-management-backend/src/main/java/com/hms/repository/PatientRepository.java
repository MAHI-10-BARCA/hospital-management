package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hms.entity.Patient;
import com.hms.entity.User;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // ✅ ADD THIS: Find patient by user
    Optional<Patient> findByUser(User user);
    
    // ✅ ADD THIS: Find patient by user ID
    Optional<Patient> findByUserId(Long userId);
        @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id IN " +
           "(SELECT d.id FROM Doctor d WHERE d.user.id = :doctorUserId)")
    List<Patient> findPatientsByDoctorUserId(@Param("doctorUserId") Long doctorUserId);
    
    // Alternative method if you prefer using doctor ID directly
    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id = :doctorId")
    List<Patient> findPatientsByDoctorId(@Param("doctorId") Long doctorId);
}