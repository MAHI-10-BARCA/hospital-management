package com.hms.service;

import java.util.List;
import java.util.Optional; // ✅ ADD THIS IMPORT

import org.springframework.stereotype.Service;

import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    // Get doctor by user ID
    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }

    // Create doctor profile for a user
    public Doctor createDoctorForUser(Long userId, Doctor doctorDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Check if doctor already exists for this user
        if (doctorRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }
        
        doctorDetails.setUser(user);
        return doctorRepository.save(doctorDetails);
    }

    // ✅ ADD THIS: Auto-create doctor profile if not exists
    public Doctor getOrCreateDoctorForUser(Long userId) {
        // Try to find existing doctor
        Optional<Doctor> existingDoctor = doctorRepository.findByUserId(userId);
        if (existingDoctor.isPresent()) {
            return existingDoctor.get();
        }
        
        // Create new doctor profile if not exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Doctor newDoctor = new Doctor();
        newDoctor.setName(user.getUsername()); // Use username as default name
        newDoctor.setSpecialization("General"); // Default specialization
        newDoctor.setContact("Not provided"); // Default contact
        newDoctor.setUser(user);
        
        return doctorRepository.save(newDoctor);
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setName(updatedDoctor.getName());
            doctor.setSpecialization(updatedDoctor.getSpecialization());
            doctor.setContact(updatedDoctor.getContact());
            return doctorRepository.save(doctor);
        }).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }
}