package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.Patient;
import com.hms.entity.User;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // ✅ ADD THIS: Find patient by user
    Optional<Patient> findByUser(User user);
    
    // ✅ ADD THIS: Find patient by user ID
    Optional<Patient> findByUserId(Long userId);
}