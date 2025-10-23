package com.hms.controller;

import java.util.List;
import java.util.Optional;

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

import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import com.hms.service.PatientService;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public PatientController(PatientService patientService, UserRepository userRepository, PatientRepository patientRepository) {
        this.patientService = patientService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody Patient patient, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("👤 Creating patient by user: " + username);
            System.out.println("📝 Patient data: " + patient.getName() + ", Age: " + patient.getAge() + ", Gender: " + patient.getGender());
            
            // ✅ FIXED: Allow patients to create their own profiles
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if patient already has a profile
            Optional<Patient> existingPatient = patientRepository.findByUser(currentUser);
            if (existingPatient.isPresent()) {
                return ResponseEntity.badRequest().body("Patient profile already exists for this user");
            }
            
            // For patients, they can only create their own profile
            boolean isPatient = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_PATIENT"));
            
            if (isPatient) {
                // Patients can only create their own profile
                patient.setUser(currentUser);
            } else {
                // Admins/Doctors can create patient profiles without linking to current user
                // Check if they have permission
                boolean hasPermission = authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || 
                                         auth.getAuthority().equals("ROLE_DOCTOR"));
                
                if (!hasPermission) {
                    return ResponseEntity.badRequest().body("Only admins and doctors can create patient profiles for others");
                }
                
                // If patient has no user, create one
                if (patient.getUser() == null) {
                    // This will auto-create a user in the service
                    System.out.println("👤 Patient has no user, will auto-create in service");
                }
            }
            
            Patient savedPatient = patientService.savePatient(patient);
            System.out.println("✅ Patient created successfully with ID: " + savedPatient.getId());
            return ResponseEntity.ok(savedPatient);
        } catch (Exception e) {
            System.err.println("❌ Error creating patient: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create patient: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPatients(Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("📋 Fetching patients for user: " + username);
            
            List<Patient> patients = patientService.getAllPatients(username);
            System.out.println("✅ Found " + patients.size() + " patients");
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            System.err.println("❌ Error fetching patients: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to load patients: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("🔍 Fetching patient " + id + " for user: " + username);
            
            Optional<Patient> patient = patientService.getPatientById(id);
            if (patient.isPresent()) {
                System.out.println("✅ Patient found: " + patient.get().getName());
                return ResponseEntity.ok(patient.get());
            } else {
                System.out.println("❌ Patient not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error fetching patient: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to load patient: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient patient, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("✏️ Updating patient " + id + " by user: " + username);
            
            // ✅ FIXED: Allow patients to update their own profiles
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if patient exists
            Optional<Patient> existingPatient = patientService.getPatientById(id);
            if (existingPatient.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Check permissions
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isOwnProfile = existingPatient.get().getUser() != null && 
                                 existingPatient.get().getUser().getId().equals(currentUser.getId());
            
            if (!isAdmin && !isOwnProfile) {
                return ResponseEntity.badRequest().body("You can only update your own patient profile");
            }
            
            Patient updatedPatient = patientService.updatePatient(id, patient);
            System.out.println("✅ Patient updated successfully: " + updatedPatient.getName());
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            System.err.println("❌ Error updating patient: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update patient: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("🗑️ Deleting patient " + id + " by user: " + username);
            
            // Check if user has admin role to delete patients
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                return ResponseEntity.badRequest().body("Only admins can delete patient accounts");
            }
            
            patientService.deletePatient(id);
            System.out.println("✅ Patient deleted successfully");
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Error deleting patient: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete patient: " + e.getMessage());
        }
    }
}