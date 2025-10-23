package com.hms.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Save doctor - creates User account if not exists
     */
    @Transactional
    public Doctor saveDoctor(Doctor doctor) {
        System.out.println("💾 Saving doctor: " + doctor.getName());

        // If doctor has no User, create one
        if (doctor.getUser() == null) {
            System.out.println("👤 Creating a new user account for doctor");

            // Generate username from name
            String baseUsername = generateUsername(doctor.getName());
            String username = getUniqueUsername(baseUsername);
            
            // Default password
            String defaultPassword = "doctor123";

            // Create new User
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(defaultPassword));
            newUser.setRoles(Set.of("ROLE_DOCTOR"));

            // Save User
            newUser = userRepository.save(newUser);

            // Link doctor to the new user
            doctor.setUser(newUser);

            System.out.println("✅ Created User account: " + newUser.getUsername() + " for doctor " + doctor.getName());
        } else {
            System.out.println("👤 Doctor already has a user: " + doctor.getUser().getUsername());
        }

        // Save doctor
        return doctorRepository.save(doctor);
    }

    /**
     * Generate unique username
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
    @Transactional
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

    // ✅ FIXED: Auto-create doctor profile if not exists
    @Transactional
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
        
        System.out.println("✅ Auto-creating doctor profile for user ID: " + userId);
        return doctorRepository.save(newDoctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        
        // Delete doctor first, then user if needed
        doctorRepository.delete(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setName(updatedDoctor.getName());
            doctor.setSpecialization(updatedDoctor.getSpecialization());
            doctor.setContact(updatedDoctor.getContact());
            
            // Update user username if name changed
            if (!doctor.getName().equals(updatedDoctor.getName()) && doctor.getUser() != null) {
                String newUsername = generateUsername(updatedDoctor.getName());
                String uniqueUsername = getUniqueUsername(newUsername);
                doctor.getUser().setUsername(uniqueUsername);
                userRepository.save(doctor.getUser());
            }
            
            return doctorRepository.save(doctor);
        }).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    /**
     * ✅ IMPROVED: Get current doctor profile with auto-creation if missing
     */
    @Transactional
    public Doctor getCurrentDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<Doctor> existingDoctor = doctorRepository.findByUser(user);
        if (existingDoctor.isPresent()) {
            return existingDoctor.get();
        }
        
        // Auto-create doctor profile if missing
        System.out.println("⚠️ Doctor profile not found for user: " + username + ", auto-creating...");
        Doctor newDoctor = new Doctor();
        newDoctor.setName(user.getUsername());
        newDoctor.setSpecialization("General");
        newDoctor.setContact("Not provided");
        newDoctor.setUser(user);
        
        return doctorRepository.save(newDoctor);
    }
}