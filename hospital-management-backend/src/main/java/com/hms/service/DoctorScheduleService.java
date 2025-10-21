package com.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.entity.Doctor;
import com.hms.entity.DoctorSchedule;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorScheduleRepository;
import com.hms.repository.UserRepository;

@Service
public class DoctorScheduleService {

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorService doctorService;

    public DoctorSchedule createSchedule(DoctorSchedule schedule, String createdBy) {
        schedule.setCreatedBy(createdBy);
        return scheduleRepository.save(schedule);
    }

    public DoctorSchedule createDoctorSchedule(DoctorSchedule schedule, Long userId) {
        System.out.println("🔄 Creating schedule for user ID: " + userId);
        
        // ✅ FIXED: Auto-create doctor profile if not exists
        Doctor doctor = doctorService.getOrCreateDoctorForUser(userId);
        System.out.println("✅ Using doctor ID: " + doctor.getId() + " for user ID: " + userId);
        
        schedule.setDoctor(doctor);
        schedule.setCreatedBy("DOCTOR");
        
        return scheduleRepository.save(schedule);
    }

    public List<DoctorSchedule> getAvailableSchedulesForDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user: " + userId));
        
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

    // ✅ ADD THIS: Get schedules for current doctor (security fix)
    public List<DoctorSchedule> getSchedulesForCurrentDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        return scheduleRepository.findByDoctorId(doctor.getId());
    }

    public DoctorSchedule updateSchedule(Long id, DoctorSchedule scheduleDetails, String userRole, String username) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // ✅ ADDED: Authorization check - doctors can only update their own schedules
        if ("DOCTOR".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (!schedule.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("You can only update your own schedules");
            }
        }

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

    public void deleteSchedule(Long id, String username, String userRole) {
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // ✅ ADDED: Authorization check - doctors can only delete their own schedules
        if ("DOCTOR".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (!schedule.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("You can only delete your own schedules");
            }
        }

        scheduleRepository.delete(schedule);
    }
}