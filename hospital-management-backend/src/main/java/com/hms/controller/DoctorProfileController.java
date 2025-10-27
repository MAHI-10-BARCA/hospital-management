package com.hms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;

@RestController
@RequestMapping("/api/doctor-profile")
@CrossOrigin(origins = "*")
public class DoctorProfileController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    // Check if current user has a doctor profile
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkDoctorProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean hasProfile = doctorRepository.findByUser(user).isPresent();
        return ResponseEntity.ok(hasProfile);
    }

    // Get current user's doctor profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyDoctorProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found for user: " + username));

            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Create doctor profile for current user
    @PostMapping("/create")
    public ResponseEntity<?> createDoctorProfile(
            @RequestBody Doctor doctorDetails,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if doctor profile already exists
            if (doctorRepository.findByUser(user).isPresent()) {
                return ResponseEntity.badRequest().body("Doctor profile already exists");
            }

            // Create new doctor profile
            Doctor doctor = new Doctor();
            doctor.setName(doctorDetails.getName());
            doctor.setSpecialization(doctorDetails.getSpecialization());
            doctor.setContact(doctorDetails.getContact());
            doctor.setUser(user);

            Doctor savedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating doctor profile: " + e.getMessage());
        }
    }

    // Update current user's doctor profile
    @PutMapping("/me")
    public ResponseEntity<?> updateDoctorProfile(
            @RequestBody Doctor doctorDetails,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Doctor existingDoctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            // Update doctor details
            existingDoctor.setName(doctorDetails.getName());
            existingDoctor.setSpecialization(doctorDetails.getSpecialization());
            existingDoctor.setContact(doctorDetails.getContact());

            Doctor updatedDoctor = doctorRepository.save(existingDoctor);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}