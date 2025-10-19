package com.hms.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.AppointmentResponseDTO;
import com.hms.entity.Appointment;
import com.hms.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(
            @RequestBody Appointment appointment,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("📅 Creating appointment for user: " + username);
        
        try {
            AppointmentResponseDTO createdAppointment = appointmentService.createAppointment(appointment);
            return ResponseEntity.ok(createdAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error creating appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("📅 Fetching appointments for user: " + username);
        
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching appointments: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(id);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatient(@PathVariable Long patientId) {
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByPatient(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByStatus(@PathVariable String status) {
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByStatus(status);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("📅 Fetching appointments for current user: " + username);
        
        try {
            // For now, return all appointments - you can implement user-specific filtering later
            List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user appointments: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error fetching appointments");
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("🔄 Updating appointment " + id + " status to: " + status + " by user: " + username);
        
        try {
            AppointmentResponseDTO updatedAppointment = appointmentService.updateAppointmentStatus(id, status, username);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating appointment status: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("❌ Cancelling appointment " + id + " by user: " + username);
        
        try {
            AppointmentResponseDTO cancelledAppointment = appointmentService.updateAppointmentStatus(id, "CANCELLED", username);
            return ResponseEntity.ok(cancelledAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error cancelling appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointmentUpdates,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("✏️ Updating appointment " + id + " by user: " + username);
        
        try {
            AppointmentResponseDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentUpdates);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("🗑️ Deleting appointment " + id + " by user: " + username);
        
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("❌ Error deleting appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAppointmentStats() {
        try {
            // For now, return basic stats - you can implement proper statistics later
            List<AppointmentResponseDTO> allAppointments = appointmentService.getAllAppointments();
            
            long total = allAppointments.size();
            long scheduled = allAppointments.stream().filter(a -> "SCHEDULED".equals(a.getStatus())).count();
            long completed = allAppointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
            long cancelled = allAppointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();
            
            var stats = new Object() {
                public final long totalAppointments = total;
                public final long scheduledAppointments = scheduled;
                public final long completedAppointments = completed;
                public final long cancelledAppointments = cancelled;
            };
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("❌ Error fetching appointment stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error fetching statistics");
        }
    }
}