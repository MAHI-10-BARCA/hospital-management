package com.hms.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.ScheduleRequestDTO;
import com.hms.dto.ScheduleResponseDTO;
import com.hms.entity.DoctorSchedule;
import com.hms.service.DoctorScheduleService;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {

    @Autowired
    private DoctorScheduleService scheduleService;

    // Admin creates schedule for any doctor
    @PostMapping("/admin")
    public ResponseEntity<ScheduleResponseDTO> createScheduleByAdmin(@RequestBody ScheduleRequestDTO scheduleRequest) {
        DoctorSchedule schedule = convertToEntity(scheduleRequest);
        DoctorSchedule savedSchedule = scheduleService.createSchedule(schedule, "ADMIN");
        return ResponseEntity.ok(convertToDTO(savedSchedule));
    }

    // Doctor creates their own schedule - ✅ FIXED: Now accepts doctorId directly
    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<ScheduleResponseDTO> createScheduleByDoctor(
            @PathVariable Long doctorId, 
            @RequestBody ScheduleRequestDTO scheduleRequest) {
        System.out.println("🔄 Creating schedule for doctor ID: " + doctorId);
        
        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setAvailableDate(scheduleRequest.getAvailableDate());
        schedule.setStartTime(scheduleRequest.getStartTime());
        schedule.setEndTime(scheduleRequest.getEndTime());
        schedule.setSlotDuration(scheduleRequest.getSlotDuration());
        schedule.setMaxPatients(scheduleRequest.getMaxPatients());
        
        DoctorSchedule savedSchedule = scheduleService.createDoctorSchedule(schedule, doctorId);
        return ResponseEntity.ok(convertToDTO(savedSchedule));
    }

    // Get available slots for patients - ✅ FIXED: Now accepts doctorId directly
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<List<ScheduleResponseDTO>> getAvailableSchedules(@PathVariable Long doctorId) {
        System.out.println("🔍 PATIENT REQUEST: Looking for schedules for doctor ID: " + doctorId);
        List<DoctorSchedule> schedules = scheduleService.getAvailableSchedulesForDoctor(doctorId);
        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        System.out.println("✅ Returning " + responseDTOs.size() + " available schedules for doctor ID: " + doctorId);
        return ResponseEntity.ok(responseDTOs);
    }

    // Get all schedules for admin view - ✅ FIXED: Now accepts doctorId directly
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleResponseDTO>> getAllSchedulesForDoctor(@PathVariable Long doctorId) {
        List<DoctorSchedule> schedules = scheduleService.getSchedulesForDoctor(doctorId);
        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    // Get doctor's own schedules - ✅ FIXED: Now accepts doctorId directly
    @GetMapping("/doctor/{doctorId}/my-schedules")
    public ResponseEntity<List<ScheduleResponseDTO>> getDoctorOwnSchedules(@PathVariable Long doctorId) {
        System.out.println("🔄 Getting doctor's own schedules for doctor ID: " + doctorId);
        List<DoctorSchedule> schedules = scheduleService.getSchedulesCreatedByDoctor(doctorId);
        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    // ✅ ADD THIS: Get schedules for current doctor (security fix)
    @GetMapping("/my-schedules")
    public ResponseEntity<List<ScheduleResponseDTO>> getMySchedules(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("🔐 Getting schedules for current doctor: " + username);
        
        List<DoctorSchedule> schedules = scheduleService.getSchedulesForCurrentDoctor(username);
        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        System.out.println("✅ Returning " + responseDTOs.size() + " schedules for doctor: " + username);
        return ResponseEntity.ok(responseDTOs);
    }

    // Update schedule with proper authentication and DTO conversion
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleResponseDTO> updateSchedule(
            @PathVariable Long id,
            @RequestBody ScheduleRequestDTO scheduleRequest,
            Authentication authentication) {
        
        System.out.println("🔄 Updating schedule ID: " + id);
        
        String currentUsername = authentication.getName();
        String userRole = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .findFirst()
                .orElse("DOCTOR")
                .replace("ROLE_", "");
        
        System.out.println("🔐 Current user: " + currentUsername + ", Role: " + userRole);
        
        DoctorSchedule scheduleDetails = convertToEntity(scheduleRequest);
        DoctorSchedule updatedSchedule = scheduleService.updateSchedule(id, scheduleDetails, userRole, currentUsername);
        return ResponseEntity.ok(convertToDTO(updatedSchedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id,
            Authentication authentication) {
        
        String currentUsername = authentication.getName();
        String userRole = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .findFirst()
                .orElse("DOCTOR")
                .replace("ROLE_", "");
        
        System.out.println("🗑️ Deleting schedule ID: " + id + " by user: " + currentUsername + ", role: " + userRole);
        
        scheduleService.deleteSchedule(id, currentUsername, userRole);
        return ResponseEntity.noContent().build();
    }

    // ✅ FIXED: Helper method to convert DTO to Entity - Only for admin use
    private DoctorSchedule convertToEntity(ScheduleRequestDTO dto) {
        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setAvailableDate(dto.getAvailableDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setSlotDuration(dto.getSlotDuration());
        schedule.setMaxPatients(dto.getMaxPatients());
        
        return schedule;
    }

    // Helper method to convert Entity to Response DTO
    private ScheduleResponseDTO convertToDTO(DoctorSchedule schedule) {
        ScheduleResponseDTO dto = new ScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setDoctorId(schedule.getDoctor().getId());
        dto.setDoctorName(schedule.getDoctor().getName());
        dto.setSpecialization(schedule.getDoctor().getSpecialization());
        dto.setAvailableDate(schedule.getAvailableDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setIsBooked(schedule.getIsBooked());
        dto.setCreatedBy(schedule.getCreatedBy());
        dto.setSlotDuration(schedule.getSlotDuration());
        dto.setMaxPatients(schedule.getMaxPatients());
        
        return dto;
    }
}