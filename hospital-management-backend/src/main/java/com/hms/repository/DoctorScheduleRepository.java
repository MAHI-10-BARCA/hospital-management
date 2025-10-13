package com.hms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.DoctorSchedule;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    // Find all schedules for a specific doctor
    List<DoctorSchedule> findByDoctorId(Long doctorId);

    // Find available (not booked) schedules for a specific doctor
    List<DoctorSchedule> findByDoctorIdAndIsBookedFalse(Long doctorId);
}