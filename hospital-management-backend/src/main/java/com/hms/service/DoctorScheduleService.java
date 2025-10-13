package com.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.entity.Doctor;
import com.hms.entity.DoctorSchedule;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorScheduleRepository;

@Service
public class DoctorScheduleService {

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Admin creates a schedule
    public DoctorSchedule createSchedule(DoctorSchedule schedule) {
        // Ensure the doctor exists before saving the schedule
        Doctor doctor = doctorRepository.findById(schedule.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        schedule.setDoctor(doctor);
        return scheduleRepository.save(schedule);
    }

    // Get all schedules for a doctor (for Admin/Doctor view)
    public List<DoctorSchedule> getSchedulesForDoctor(Long doctorId) {
        return scheduleRepository.findByDoctorId(doctorId);
    }

    // Get only available slots for a doctor (for Patient view)
    public List<DoctorSchedule> getAvailableSchedulesForDoctor(Long doctorId) {
        return scheduleRepository.findByDoctorIdAndIsBookedFalse(doctorId);
    }
    
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}