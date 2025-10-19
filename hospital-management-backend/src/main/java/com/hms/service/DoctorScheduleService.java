package com.hms.service;

import com.hms.entity.Doctor;
import com.hms.entity.DoctorSchedule;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorScheduleRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorScheduleService {

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public DoctorSchedule createSchedule(DoctorSchedule schedule, String createdBy) {
        schedule.setCreatedBy(createdBy);
        return scheduleRepository.save(schedule);
    }

    public DoctorSchedule createDoctorSchedule(DoctorSchedule schedule, Long userId) {
        // Find doctor by user ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user: " + userId));
        
        schedule.setDoctor(doctor);
        schedule.setCreatedBy("DOCTOR");
        
        return scheduleRepository.save(schedule);
    }

    public List<DoctorSchedule> getAvailableSchedulesForDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user: " + userId));
        
        // Use the custom query that checks both isBooked and currentBookings
        return scheduleRepository.findAvailableSchedulesByDoctor(doctor.getId());
    }

    public List<DoctorSchedule> getSchedulesForDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user: " + userId));
        
        return scheduleRepository.findByDoctorId(doctor.getId());
    }

    public List<DoctorSchedule> getSchedulesCreatedByDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user: " + userId));
        
        return scheduleRepository.findByDoctorId(doctor.getId()).stream()
                .filter(schedule -> "DOCTOR".equals(schedule.getCreatedBy()))
                .toList();
    }

    public DoctorSchedule updateSchedule(Long id, DoctorSchedule scheduleDetails, String userRole, String username) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Authorization logic here if needed

        if (scheduleDetails.getAvailableDate() != null) {
            schedule.setAvailableDate(scheduleDetails.getAvailableDate());
        }
        if (scheduleDetails.getStartTime() != null) {
            schedule.setStartTime(scheduleDetails.getStartTime());
        }
        if (scheduleDetails.getEndTime() != null) {
            schedule.setEndTime(scheduleDetails.getEndTime());
        }
        if (scheduleDetails.getSlotDuration() != null) {
            schedule.setSlotDuration(scheduleDetails.getSlotDuration());
        }
        if (scheduleDetails.getMaxPatients() != null) {
            schedule.setMaxPatients(scheduleDetails.getMaxPatients());
        }

        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        scheduleRepository.delete(schedule);
    }
}