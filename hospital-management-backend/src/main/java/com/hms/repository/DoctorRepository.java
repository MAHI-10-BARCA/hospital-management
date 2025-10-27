package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hms.entity.Doctor;
import com.hms.entity.User;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    // Find doctor by user
    Optional<Doctor> findByUser(User user);
    
    // ✅ IMPROVED: Find doctor by user ID with explicit query
    @Query("SELECT d FROM Doctor d WHERE d.user.id = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Long userId);
}