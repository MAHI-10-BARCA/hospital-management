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

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
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
}