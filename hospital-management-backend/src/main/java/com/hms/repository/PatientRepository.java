package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hms.entity.Patient;
import com.hms.entity.User;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    Optional<Patient> findByUser(User user);
    
    // ✅ ADD THIS: Find patients by doctor's user ID (through appointments)
    @Query("SELECT DISTINCT p FROM Patient p JOIN Appointment a ON p.id = a.patient.id WHERE a.doctor.user.id = :doctorUserId")
    List<Patient> findPatientsByDoctorUserId(@Param("doctorUserId") Long doctorUserId);
    
    // ✅ ADD THIS: Find patients without user accounts
    List<Patient> findByUserIsNull();
    
    // ✅ ADD THIS: Check if patient exists by name and details (optional)
    Optional<Patient> findByNameAndAgeAndGender(String name, int age, String gender);
}