package com.hms.controller;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.JwtRequest;
import com.hms.dto.JwtResponse;
import com.hms.dto.RegistrationRequest;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import com.hms.util.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegistrationRequest registrationRequest) {
        System.out.println("🔐 Registration attempt for user: " + registrationRequest.getUsername());
        
        // Validate request data
        if (registrationRequest.getUsername() == null || registrationRequest.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required!");
        }

        if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password cannot be empty!");
        }

        // Check if username already exists
        if (userRepository.findByUsername(registrationRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists!");
        }

        // Create new User entity
        User user = new User();
        user.setUsername(registrationRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        // Set roles
        if (registrationRequest.getRoles() == null || registrationRequest.getRoles().isEmpty()) {
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            user.setRoles(roles);
        } else {
            user.setRoles(registrationRequest.getRoles());
        }

        User savedUser = userRepository.save(user);
        System.out.println("✅ User registered successfully: " + savedUser.getUsername() + " with ID: " + savedUser.getId());

        // ✅ AUTO-CREATE PROFILE BASED ON ROLE
        try {
            autoCreateProfile(savedUser, registrationRequest);
            System.out.println("✅ Auto-created profile for user: " + savedUser.getUsername());
        } catch (Exception e) {
            System.err.println("⚠️ Could not auto-create profile for user: " + savedUser.getUsername() + " - " + e.getMessage());
            // Don't fail registration if profile creation fails
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    /**
     * Auto-create patient or doctor profile based on user role
     */
    private void autoCreateProfile(User user, RegistrationRequest request) {
        Set<String> roles = user.getRoles();
        
        if (roles.contains("ROLE_PATIENT")) {
            // Auto-create patient profile
            Patient patient = new Patient();
            patient.setName(user.getUsername()); // Use username as default name
            patient.setAge(0); // Default age
            patient.setGender("Not specified"); // Default gender
            patient.setUser(user);
            
            patientRepository.save(patient);
            System.out.println("✅ Auto-created patient profile for: " + user.getUsername());
            
        } else if (roles.contains("ROLE_DOCTOR")) {
            // Auto-create doctor profile
            Doctor doctor = new Doctor();
            doctor.setName(user.getUsername()); // Use username as default name
            doctor.setSpecialization("General"); // Default specialization
            doctor.setContact("Not provided"); // Default contact
            doctor.setUser(user);
            
            doctorRepository.save(doctor);
            System.out.println("✅ Auto-created doctor profile for: " + user.getUsername());
        }
        
        // For ROLE_USER or other roles, no auto-profile creation needed
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> createAuthenticationToken(@RequestBody JwtRequest authenticationRequest) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.username(),
                        authenticationRequest.password()
                )
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.username());

        // Generate JWT token
        String token = jwtUtil.generateToken(userDetails);

        // Collect roles for frontend
        var roles = userDetails.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        // ✅ FIX: Get the actual User entity to include ID
        User user = userRepository.findByUsername(authenticationRequest.username())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        System.out.println("✅ Login successful for user: " + user.getUsername() + " with ID: " + user.getId());

        // ✅ FIX: Return complete user info including ID
        return ResponseEntity.ok(new JwtResponse(token, user.getId(), user.getUsername(), roles));
    }
}