package com.hms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // ✅ FIXED: Keep original method for backward compatibility
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // ✅ FIXED: Add role-based filtering for patients with username
    public List<Patient> getAllPatients(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Role-based data filtering
        if (currentUser.getRoles().contains("ROLE_ADMIN")) {
            // Admin sees all patients
            return patientRepository.findAll();
        } else if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            // Doctor sees only their patients (from appointments)
            return patientRepository.findPatientsByDoctorUserId(currentUser.getId());
        } else {
            // Patients and others see empty list
            return List.of();
        }
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    // ✅ ADD THIS: Get patient by user ID
    public Optional<Patient> getPatientByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUser(user);
    }

    // ✅ ADD THIS: Get or create patient for current user
    public Patient getOrCreatePatientForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Patient> existingPatient = patientRepository.findByUser(user);
        if (existingPatient.isPresent()) {
            return existingPatient.get();
        }

        // Auto-create patient profile
        Patient newPatient = new Patient();
        newPatient.setName(user.getUsername()); // Use username as default name
        newPatient.setAge(0); // Default age
        newPatient.setGender("Not specified"); // Default gender
        newPatient.setUser(user);

        return patientRepository.save(newPatient);
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatient.getName());
            patient.setAge(updatedPatient.getAge());
            patient.setGender(updatedPatient.getGender());
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // ✅ ADD THIS: Get current patient profile
    public Patient getCurrentPatient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }
}