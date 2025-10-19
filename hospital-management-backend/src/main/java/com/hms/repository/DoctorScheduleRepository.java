package com.hms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hms.entity.DoctorSchedule;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    
    List<DoctorSchedule> findByDoctorId(Long doctorId);
    
    List<DoctorSchedule> findByDoctorIdAndIsBookedFalse(Long doctorId);
    
    List<DoctorSchedule> findByDoctorIdAndCreatedBy(Long doctorId, String createdBy);
    
    // ✅ FIXED: Handle null current_bookings with COALESCE
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId AND (ds.currentBookings IS NULL OR ds.currentBookings < ds.maxPatients)")
    List<DoctorSchedule> findWithAvailableSlotsByDoctorId(@Param("doctorId") Long doctorId);
}