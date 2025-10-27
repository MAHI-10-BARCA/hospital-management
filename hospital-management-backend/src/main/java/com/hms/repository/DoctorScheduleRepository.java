package com.hms.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hms.entity.DoctorSchedule;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorId(Long doctorId);
    List<DoctorSchedule> findByAvailableDate(LocalDate availableDate);
    List<DoctorSchedule> findByDoctorIdAndAvailableDate(Long doctorId, LocalDate availableDate);
    
    // Find available schedules using isBooked field
    List<DoctorSchedule> findByIsBookedFalse();
    List<DoctorSchedule> findByDoctorIdAndIsBookedFalse(Long doctorId);
    
    // Find schedules with current bookings less than max patients
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId AND ds.isBooked = false AND ds.currentBookings < ds.maxPatients")
    List<DoctorSchedule> findAvailableSchedulesByDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId AND ds.availableDate = :date AND ds.isBooked = false AND ds.currentBookings < ds.maxPatients")
    List<DoctorSchedule> findAvailableSchedulesByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}