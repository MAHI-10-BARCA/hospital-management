package com.hms.service;

import java.util.List;
import java.util.Optional;

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

    // ✅ UPDATED: Better debugging and error handling
    private Doctor getDoctorFromUserId(Long userId) {
        System.out.println("🔍 Getting doctor for user ID: " + userId);
        
        // First get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    System.err.println("❌ User not found with id: " + userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        
        System.out.println("✅ Found user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        
        // Try to find existing doctor
        Optional<Doctor> existingDoctor = doctorRepository.findByUser(user);
        
        if (existingDoctor.isPresent()) {
            Doctor doctor = existingDoctor.get();
            System.out.println("✅ Found existing doctor: " + doctor.getName() + " (ID: " + doctor.getId() + ")");
            return doctor;
        }
        
        // AUTO-CREATE doctor profile if not exists
        System.out.println("⚠️ Auto-creating doctor profile for user: " + user.getUsername());
        
        Doctor newDoctor = new Doctor();
        newDoctor.setName(user.getUsername()); // Use username as default name
        newDoctor.setSpecialization("General"); // Default specialization
        newDoctor.setContact("Not provided"); // Default contact
        newDoctor.setUser(user);
        
        Doctor savedDoctor = doctorRepository.save(newDoctor);
        System.out.println("✅ Auto-created doctor profile with ID: " + savedDoctor.getId());
        
        return savedDoctor;
    }

    // ✅ UPDATED: Better debugging for createDoctorSchedule
    public DoctorSchedule createDoctorSchedule(DoctorSchedule schedule, Long userId) {
        System.out.println("🔄 Creating doctor schedule for user ID: " + userId);
        System.out.println("📅 Schedule details - Date: " + schedule.getAvailableDate() + 
                          ", Start: " + schedule.getStartTime() + 
                          ", End: " + schedule.getEndTime());
        
        Doctor doctor = getDoctorFromUserId(userId);
        schedule.setDoctor(doctor);
        schedule.setCreatedBy("DOCTOR");
        
        // Set defaults if not provided
        if (schedule.getSlotDuration() == null) {
            schedule.setSlotDuration(30);
        }
        if (schedule.getMaxPatients() == null) {
            schedule.setMaxPatients(1);
        }
        
        DoctorSchedule savedSchedule = scheduleRepository.save(schedule);
        System.out.println("✅ Schedule created with ID: " + savedSchedule.getId());
        
        return savedSchedule;
    }

    // Create schedule with creator information
    public DoctorSchedule createSchedule(DoctorSchedule schedule, String createdBy) {
        System.out.println("🔄 Creating schedule with creator: " + createdBy);
        System.out.println("📅 Schedule details - Date: " + schedule.getAvailableDate() + 
                          ", Start: " + schedule.getStartTime() + 
                          ", End: " + schedule.getEndTime());
        
        // Get doctor from the user ID in the schedule
        Doctor doctor = getDoctorFromUserId(schedule.getDoctor().getUser().getId());
        schedule.setDoctor(doctor);
        schedule.setCreatedBy(createdBy);
        
        // Set defaults if not provided
        if (schedule.getSlotDuration() == null) {
            schedule.setSlotDuration(30);
        }
        if (schedule.getMaxPatients() == null) {
            schedule.setMaxPatients(1);
        }
        
        DoctorSchedule savedSchedule = scheduleRepository.save(schedule);
        System.out.println("✅ Admin schedule created with ID: " + savedSchedule.getId());
        
        return savedSchedule;
    }

    // Get all schedules for a doctor
    public List<DoctorSchedule> getSchedulesForDoctor(Long userId) {
        System.out.println("🔄 Getting all schedules for user ID: " + userId);
        Doctor doctor = getDoctorFromUserId(userId);
        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorId(doctor.getId());
        System.out.println("✅ Found " + schedules.size() + " schedules for doctor: " + doctor.getName());
        return schedules;
    }

    // Get available schedules for a doctor
public List<DoctorSchedule> getAvailableSchedulesForDoctor(Long userId) {
    System.out.println("🔄 Getting available schedules for user ID: " + userId);
    Doctor doctor = getDoctorFromUserId(userId);
    
    // ✅ FIXED: Use the safe query that handles null values
    List<DoctorSchedule> schedules = scheduleRepository.findWithAvailableSlotsByDoctorId(doctor.getId());
    
    System.out.println("✅ Found " + schedules.size() + " available schedules for doctor: " + doctor.getName());
    
    // Enhanced debug info
    schedules.forEach(schedule -> {
        Integer current = schedule.getCurrentBookings(); // This uses our safe getter
        Integer max = schedule.getMaxPatients();
        System.out.println("📊 Schedule " + schedule.getId() + ": " + 
                         current + "/" + max + " bookings (" + 
                         (max - current) + " available)");
    });
    
    return schedules;
}

    // Get schedules created by specific doctor
    public List<DoctorSchedule> getSchedulesCreatedByDoctor(Long userId) {
        System.out.println("🔄 Getting doctor's own schedules for user ID: " + userId);
        Doctor doctor = getDoctorFromUserId(userId);
        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorIdAndCreatedBy(doctor.getId(), "DOCTOR");
        System.out.println("✅ Found " + schedules.size() + " schedules created by doctor: " + doctor.getName());
        return schedules;
    }

    public void deleteSchedule(Long id) {
        System.out.println("🗑️ Deleting schedule ID: " + id);
        scheduleRepository.deleteById(id);
        System.out.println("✅ Schedule deleted: " + id);
    }

    // ✅ FIXED: Update schedule method with proper authorization using username
    public DoctorSchedule updateSchedule(Long scheduleId, DoctorSchedule scheduleDetails, String currentUserRole, String currentUsername) {
        System.out.println("🔄 Updating schedule ID: " + scheduleId);
        System.out.println("🔐 Current user role: " + currentUserRole + ", Username: " + currentUsername);
        System.out.println("📅 Update details - Date: " + scheduleDetails.getAvailableDate() + 
                          ", Start: " + scheduleDetails.getStartTime() + 
                          ", End: " + scheduleDetails.getEndTime());
        
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> {
                    System.err.println("❌ Schedule not found with ID: " + scheduleId);
                    return new RuntimeException("Schedule not found");
                });
        
        System.out.println("📋 Found schedule - Created by: " + schedule.getCreatedBy() + 
                          ", Doctor: " + schedule.getDoctor().getName() +
                          ", Doctor User: " + schedule.getDoctor().getUser().getUsername());
        
        // ✅ IMPROVED: Authorization check - allow admin OR the doctor who owns the schedule
        boolean isAuthorized = false;
        
        if ("ADMIN".equals(currentUserRole)) {
            isAuthorized = true;
            System.out.println("✅ Admin authorized to update any schedule");
        } else {
            // Check if current user is the doctor who owns this schedule
            String scheduleDoctorUsername = schedule.getDoctor().getUser().getUsername();
            if (currentUsername.equals(scheduleDoctorUsername) && "DOCTOR".equals(schedule.getCreatedBy())) {
                isAuthorized = true;
                System.out.println("✅ Doctor authorized to update their own schedule");
            } else {
                System.err.println("❌ Not authorized - Current user: " + currentUsername + 
                                 ", Schedule doctor: " + scheduleDoctorUsername +
                                 ", Schedule created by: " + schedule.getCreatedBy());
            }
        }
        
        if (!isAuthorized) {
            throw new RuntimeException("Not authorized to update this schedule");
        }
        
        // Update schedule fields
        schedule.setAvailableDate(scheduleDetails.getAvailableDate());
        schedule.setStartTime(scheduleDetails.getStartTime());
        schedule.setEndTime(scheduleDetails.getEndTime());
        schedule.setSlotDuration(scheduleDetails.getSlotDuration());
        schedule.setMaxPatients(scheduleDetails.getMaxPatients());
        // Don't update isBooked field when editing schedule
        
        DoctorSchedule updatedSchedule = scheduleRepository.save(schedule);
        System.out.println("✅ Schedule updated successfully: " + updatedSchedule.getId());
        
        return updatedSchedule;
    }

    // ✅ UPDATED: Better debugging for ownership check
    public boolean isScheduleOwnedByDoctor(Long scheduleId, Long userId) {
        System.out.println("🔍 Checking schedule ownership - Schedule ID: " + scheduleId + ", User ID: " + userId);
        
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> {
                    System.err.println("❌ Schedule not found with ID: " + scheduleId);
                    return new RuntimeException("Schedule not found");
                });
        
        Doctor doctor = getDoctorFromUserId(userId);
        boolean isOwned = schedule.getDoctor().getId().equals(doctor.getId()) && "DOCTOR".equals(schedule.getCreatedBy());
        
        System.out.println("✅ Ownership check result: " + isOwned);
        System.out.println("📋 Schedule doctor ID: " + schedule.getDoctor().getId() + 
                          ", Current doctor ID: " + doctor.getId() + 
                          ", Created by: " + schedule.getCreatedBy());
        
        return isOwned;
    }
}