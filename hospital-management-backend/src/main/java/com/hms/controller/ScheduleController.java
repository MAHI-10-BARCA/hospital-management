package com.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.DoctorSchedule;
import com.hms.service.DoctorScheduleService;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*") // Configure for your frontend URL
public class ScheduleController {

    @Autowired
    private DoctorScheduleService scheduleService;

    // Endpoint for Admin to create a new schedule slot
    @PostMapping
    public ResponseEntity<DoctorSchedule> createSchedule(@RequestBody DoctorSchedule schedule) {
        return ResponseEntity.ok(scheduleService.createSchedule(schedule));
    }

    // Endpoint for anyone to see a doctor's AVAILABLE slots
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<List<DoctorSchedule>> getAvailableSchedules(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getAvailableSchedulesForDoctor(doctorId));
    }

    // Endpoint for Admin/Doctor to see ALL of a doctor's slots (booked and unbooked)
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorSchedule>> getAllSchedulesForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getSchedulesForDoctor(doctorId));
    }
    
    // Endpoint for Admin to remove a schedule slot
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}