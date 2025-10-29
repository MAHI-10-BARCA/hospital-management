package com.hms.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.PatientProfileDTO;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Save or create a patient.
     * - If patient has no User, a User is auto-created.
     * - If patient already has a User, just save the patient.
     */
    @Transactional
    public Patient savePatient(Patient patient) {
        System.out.println("💾 Saving patient: " + patient.getName());

        if (patient.getUser() == null) {
            System.out.println("👤 Creating a new user account for patient");

            // Generate username from name
            String baseUsername = generateUsername(patient.getName());
            String username = getUniqueUsername(baseUsername);
            
            // Default password
            String defaultPassword = "patient123";

            // Create a new User
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(defaultPassword));
            newUser.setRoles(Set.of("ROLE_PATIENT"));

            // Save User
            newUser = userRepository.save(newUser);

            // Link patient to the new user
            patient.setUser(newUser);

            System.out.println("✅ Created User account: " + newUser.getUsername() + " for patient " + patient.getName());
        } else {
            System.out.println("👤 Patient already has a user: " + patient.getUser().getUsername());
        }

        // Save patient
        return patientRepository.save(patient);
    }

    /**
     * Generate username from name
     */
    private String generateUsername(String name) {
        // Remove spaces and convert to lowercase
        String baseUsername = name.toLowerCase().replaceAll("\\s+", "");
        
        // Remove special characters, keep only letters and numbers
        baseUsername = baseUsername.replaceAll("[^a-z0-9]", "");
        
        return baseUsername;
    }

    /**
     * Ensure username is unique by appending numbers if needed
     */
    private String getUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    /**
     * Get patients based on role
     */
    public List<Patient> getAllPatients(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        System.out.println("🎯 Role-based patient filtering for user: " + username + " with roles: " + currentUser.getRoles());

        if (currentUser.getRoles().contains("ROLE_ADMIN")) {
            return patientRepository.findAll();
        } else if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            // Doctors can see all patients (or only their patients based on appointments)
            return patientRepository.findAll();
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Optional<Patient> patient = patientRepository.findByUser(currentUser);
            return patient.map(List::of).orElse(List.of());
        } else {
            return List.of();
        }
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUser(user);
    }

    @Transactional
    public Patient getOrCreatePatientForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Patient> existingPatient = patientRepository.findByUser(user);
        if (existingPatient.isPresent()) return existingPatient.get();

        // Auto-create patient profile
        Patient newPatient = new Patient();
        newPatient.setName(user.getUsername());
        newPatient.setAge(0);
        newPatient.setGender("Not specified");
        newPatient.setUser(user);

        return patientRepository.save(newPatient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        // Delete patient first, then user if needed
        patientRepository.delete(patient);
    }

    @Transactional
    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatient.getName());
            patient.setAge(updatedPatient.getAge());
            patient.setGender(updatedPatient.getGender());
            
            // Update user username if name changed and user exists
            if (!patient.getName().equals(updatedPatient.getName()) && patient.getUser() != null) {
                String newUsername = generateUsername(updatedPatient.getName());
                String uniqueUsername = getUniqueUsername(newUsername);
                patient.getUser().setUsername(uniqueUsername);
                userRepository.save(patient.getUser());
            }
            
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
    }

    /**
     * ✅ IMPROVED: Get current patient with auto-creation if missing
     */
    @Transactional
    public Patient getCurrentPatient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<Patient> existingPatient = patientRepository.findByUser(user);
        if (existingPatient.isPresent()) {
            return existingPatient.get();
        }
        
        // Auto-create patient profile if missing
        System.out.println("⚠️ Patient profile not found for user: " + username + ", auto-creating...");
        Patient newPatient = new Patient();
        newPatient.setName(user.getUsername());
        newPatient.setAge(0);
        newPatient.setGender("Not specified");
        newPatient.setUser(user);
        
        return patientRepository.save(newPatient);
    }

    public List<Patient> getPatientsWithoutUsers() {
        return patientRepository.findByUserIsNull();
    }

    /**
     * ✅ ADDED: Create patient profile for current user
     */
    @Transactional
    public Patient createPatientForCurrentUser(String username, Patient patientDetails) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if patient already exists for this user
        if (patientRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("Patient profile already exists for this user");
        }
        
        // Create new patient profile
        Patient patient = new Patient();
        patient.setName(patientDetails.getName());
        patient.setAge(patientDetails.getAge());
        patient.setGender(patientDetails.getGender());
        patient.setUser(user);

        return patientRepository.save(patient);
    }
    public Patient updatePatientProfile(String username, PatientProfileDTO patientProfileDTO) {
    Patient existingPatient = getCurrentPatient(username);
    
    // Update patient-specific fields
    existingPatient.setName(patientProfileDTO.getName());
    existingPatient.setAge(patientProfileDTO.getAge());
    existingPatient.setGender(patientProfileDTO.getGender());
    existingPatient.setBloodGroup(patientProfileDTO.getBloodGroup());
    existingPatient.setHeight(patientProfileDTO.getHeight());
    existingPatient.setWeight(patientProfileDTO.getWeight());
    existingPatient.setAllergies(patientProfileDTO.getAllergies());
    existingPatient.setCurrentMedications(patientProfileDTO.getCurrentMedications());
    existingPatient.setPastMedicalHistory(patientProfileDTO.getPastMedicalHistory());
    existingPatient.setFamilyMedicalHistory(patientProfileDTO.getFamilyMedicalHistory());
    existingPatient.setPrimaryPhysician(patientProfileDTO.getPrimaryPhysician());
    existingPatient.setInsuranceProvider(patientProfileDTO.getInsuranceProvider());
    existingPatient.setInsurancePolicyNumber(patientProfileDTO.getInsurancePolicyNumber());
    existingPatient.setInsuranceGroupNumber(patientProfileDTO.getInsuranceGroupNumber());
    existingPatient.setEmergencyMedicalConditions(patientProfileDTO.getEmergencyMedicalConditions());
    existingPatient.setPreferredPharmacy(patientProfileDTO.getPreferredPharmacy());
    existingPatient.setMaritalStatus(patientProfileDTO.getMaritalStatus());
    existingPatient.setOccupation(patientProfileDTO.getOccupation());
    
    return patientRepository.save(existingPatient);
}
}