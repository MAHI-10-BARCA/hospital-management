package com.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
        System.out.println("📦 Appointment data received: " + appointment);
        
        try {
            AppointmentResponseDTO createdAppointment = appointmentService.createAppointment(appointment, username);
            return ResponseEntity.ok(createdAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error creating appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("APPOINTMENT_CREATION_FAILED", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error creating appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred"));
        }
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("📅 Fetching appointments for user: " + username);
        
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments(username);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching appointments: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(
            @PathVariable Long id,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("🔍 Fetching appointment " + id + " for user: " + username);
        
        try {
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(id, username);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error fetching appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("📅 Fetching appointments for patient " + patientId + " by user: " + username);
        
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByPatient(patientId, username);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching patient appointments: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("📅 Fetching appointments for doctor " + doctorId + " by user: " + username);
        
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorId, username);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching doctor appointments: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByStatus(
            @PathVariable String status,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("📅 Fetching " + status + " appointments for user: " + username);
        
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByStatus(status, username);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("❌ Error fetching appointments by status: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
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
            AppointmentResponseDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentUpdates, username);
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
            appointmentService.deleteAppointment(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("❌ Error deleting appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAppointmentStats(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("📊 Fetching appointment stats for user: " + username);
        
        try {
            List<AppointmentResponseDTO> allAppointments = appointmentService.getAllAppointments(username);
            
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

    // ✅ ADDED: Error response class for better error handling
    public static class ErrorResponse {
        private String error;
        private String message;
        
        public ErrorResponse() {}
        
        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}