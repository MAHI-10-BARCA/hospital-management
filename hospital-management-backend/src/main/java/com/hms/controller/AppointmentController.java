package com.hms.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
        
        System.out.println("📅 Creating appointment with data: " + appointment);
        System.out.println("👤 Current user: " + authentication.getName());
        
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        try {
            Appointment createdAppointment = appointmentService.createAppointment(appointment, userRole, username);
            System.out.println("✅ Appointment created successfully: " + createdAppointment.getId());
            return ResponseEntity.ok(createdAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error creating appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllAppointments(Authentication authentication) {
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        System.out.println("🔍 Getting appointments for user: " + username + " with role: " + userRole);
        
        try {
            // Return DTOs with detailed information for better frontend display
            if ("PATIENT".equals(userRole)) {
                List<AppointmentResponseDTO> patientAppointments = appointmentService.getAppointmentsForCurrentPatientWithDetails(username);
                System.out.println("✅ Found " + patientAppointments.size() + " appointments for patient: " + username);
                return ResponseEntity.ok(patientAppointments);
            } else if ("DOCTOR".equals(userRole)) {
                List<AppointmentResponseDTO> doctorAppointments = appointmentService.getAppointmentsForCurrentDoctorWithDetails(username);
                System.out.println("✅ Found " + doctorAppointments.size() + " appointments for doctor: " + username);
                return ResponseEntity.ok(doctorAppointments);
            } else {
                // ADMIN gets all appointments with details
                List<AppointmentResponseDTO> allAppointments = appointmentService.getAllAppointmentsWithDetails();
                System.out.println("✅ Found " + allAppointments.size() + " total appointments");
                return ResponseEntity.ok(allAppointments);
            }
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting appointments: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        System.out.println("🔍 Getting appointment by ID: " + id);
        try {
            Optional<AppointmentResponseDTO> appointment = appointmentService.getAppointmentWithDetailsById(id);
            if (appointment.isPresent()) {
                System.out.println("✅ Found appointment: " + appointment.get().getId());
                return ResponseEntity.ok(appointment.get());
            } else {
                System.err.println("❌ Appointment not found: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsForPatient(@PathVariable Long patientId) {
        System.out.println("🔍 Getting appointments for patient ID: " + patientId);
        List<Appointment> appointments = appointmentService.getAppointmentsForPatient(patientId);
        System.out.println("✅ Found " + appointments.size() + " appointments for patient: " + patientId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsForDoctor(@PathVariable Long doctorId) {
        System.out.println("🔍 Getting appointments for doctor ID: " + doctorId);
        List<Appointment> appointments = appointmentService.getAppointmentsForDoctor(doctorId);
        System.out.println("✅ Found " + appointments.size() + " appointments for doctor: " + doctorId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(Authentication authentication) {
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        System.out.println("🔍 Getting my appointments for user: " + username + " with role: " + userRole);
        
        try {
            if ("PATIENT".equals(userRole)) {
                List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsForCurrentPatientWithDetails(username);
                System.out.println("✅ Found " + appointments.size() + " appointments for patient: " + username);
                return ResponseEntity.ok(appointments);
            } else if ("DOCTOR".equals(userRole)) {
                List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsForCurrentDoctorWithDetails(username);
                System.out.println("✅ Found " + appointments.size() + " appointments for doctor: " + username);
                return ResponseEntity.ok(appointments);
            } else {
                List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointmentsWithDetails();
                System.out.println("✅ Found " + appointments.size() + " total appointments for admin");
                return ResponseEntity.ok(appointments);
            }
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting my appointments: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAppointmentsByStatus(@PathVariable String status) {
        System.out.println("🔍 Getting appointments by status: " + status);
        try {
            List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByStatus(status);
            System.out.println("✅ Found " + appointments.size() + " appointments with status: " + status);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting appointments by status: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            Authentication authentication) {
        
        System.out.println("🔄 Updating appointment status - ID: " + id + ", Status: " + status);
        System.out.println("👤 Current user: " + authentication.getName());
        
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        try {
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, status, userRole, username);
            System.out.println("✅ Appointment status updated successfully: " + updatedAppointment.getId());
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating appointment status: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointmentDetails,
            Authentication authentication) {
        
        System.out.println("🔄 Updating appointment - ID: " + id);
        System.out.println("👤 Current user: " + authentication.getName());
        
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        try {
            Appointment updatedAppointment = appointmentService.updateAppointment(id, appointmentDetails, userRole, username);
            System.out.println("✅ Appointment updated successfully: " + updatedAppointment.getId());
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            System.err.println("❌ Error updating appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        
        System.out.println("❌ Cancelling appointment: " + id);
        System.out.println("👤 Current user: " + authentication.getName());
        
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        try {
            appointmentService.cancelAppointment(id, userRole, username);
            System.out.println("✅ Appointment cancelled successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("❌ Error cancelling appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        
        System.out.println("🗑️ Deleting appointment: " + id);
        System.out.println("👤 Current user: " + authentication.getName());
        
        String userRole = getUserRoleFromAuthentication(authentication);
        String username = authentication.getName();
        
        try {
            appointmentService.deleteAppointment(id, userRole, username);
            System.out.println("✅ Appointment deleted successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("❌ Error deleting appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<String> getAppointmentStats() {
        String stats = appointmentService.getAppointmentStats();
        System.out.println("📊 Appointment stats: " + stats);
        return ResponseEntity.ok(stats);
    }

    // Helper method to extract user role from authentication
    private String getUserRoleFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getAuthorities() != null) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                String role = authority.getAuthority();
                // Convert ROLE_ADMIN → ADMIN, ROLE_DOCTOR → DOCTOR, etc.
                if (role.startsWith("ROLE_")) {
                    return role.substring(5); // Remove "ROLE_" prefix
                }
                return role;
            }
        }
        return "PATIENT"; // default fallback
    }
}