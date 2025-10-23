package com.hms.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.Doctor;
import com.hms.service.DoctorService;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody Doctor doctor, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("👤 Creating doctor by user: " + username);
            System.out.println("📝 Doctor data: " + doctor.getName() + ", Specialization: " + doctor.getSpecialization());
            
            // Check if user has admin role to create doctors
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                return ResponseEntity.badRequest().body("Only admins can create doctor accounts");
            }
            
            Doctor savedDoctor = doctorService.saveDoctor(doctor);
            System.out.println("✅ Doctor created successfully with ID: " + savedDoctor.getId());
            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            System.err.println("❌ Error creating doctor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create doctor: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllDoctors(Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("📋 Fetching doctors for user: " + username);
            
            List<Doctor> doctors = doctorService.getAllDoctors();
            System.out.println("✅ Found " + doctors.size() + " doctors");
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            System.err.println("❌ Error fetching doctors: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to load doctors: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("🔍 Fetching doctor " + id + " for user: " + username);
            
            return doctorService.getDoctorById(id)
                    .map(doctor -> {
                        System.out.println("✅ Doctor found: " + doctor.getName());
                        return ResponseEntity.ok(doctor);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Error fetching doctor: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to load doctor: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("✏️ Updating doctor " + id + " by user: " + username);
            
            // Check if user has admin role to update doctors
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                return ResponseEntity.badRequest().body("Only admins can update doctor accounts");
            }
            
            Doctor updatedDoctor = doctorService.updateDoctor(id, doctor);
            System.out.println("✅ Doctor updated successfully: " + updatedDoctor.getName());
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            System.err.println("❌ Error updating doctor: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update doctor: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("🗑️ Deleting doctor " + id + " by user: " + username);
            
            // Check if user has admin role to delete doctors
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                return ResponseEntity.badRequest().body("Only admins can delete doctor accounts");
            }
            
            doctorService.deleteDoctor(id);
            System.out.println("✅ Doctor deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Error deleting doctor: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete doctor: " + e.getMessage());
        }
    }
}