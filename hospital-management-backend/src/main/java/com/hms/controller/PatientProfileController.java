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

import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;

@RestController
@RequestMapping("/api/patient-profile")
@CrossOrigin(origins = "*")
public class PatientProfileController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    // Check if current user has a patient profile
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkPatientProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean hasProfile = patientRepository.findByUser(user).isPresent();
        return ResponseEntity.ok(hasProfile);
    }

    // Get current user's patient profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyPatientProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Patient patient = patientRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));

            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Create patient profile for current user
    @PostMapping("/create")
    public ResponseEntity<?> createPatientProfile(
            @RequestBody Patient patientDetails,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if patient profile already exists
            if (patientRepository.findByUser(user).isPresent()) {
                return ResponseEntity.badRequest().body("Patient profile already exists");
            }

            // Create new patient profile
            Patient patient = new Patient();
            patient.setName(patientDetails.getName());
            patient.setAge(patientDetails.getAge());
            patient.setGender(patientDetails.getGender());
            patient.setUser(user);

            Patient savedPatient = patientRepository.save(patient);
            return ResponseEntity.ok(savedPatient);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating patient profile: " + e.getMessage());
        }
    }

    // Update current user's patient profile
    @PutMapping("/me")
    public ResponseEntity<?> updatePatientProfile(
            @RequestBody Patient patientDetails,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Patient existingPatient = patientRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));

            // Update patient details
            existingPatient.setName(patientDetails.getName());
            existingPatient.setAge(patientDetails.getAge());
            existingPatient.setGender(patientDetails.getGender());

            Patient updatedPatient = patientRepository.save(existingPatient);
            return ResponseEntity.ok(updatedPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}