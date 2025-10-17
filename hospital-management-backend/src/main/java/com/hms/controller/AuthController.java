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
import com.hms.dto.RegistrationRequest; // ADD THIS IMPORT
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.util.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ FIXED Registration endpoint - Use RegistrationRequest DTO
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegistrationRequest registrationRequest) {
        System.out.println("🔐 Registration attempt for user: " + registrationRequest.getUsername());
        System.out.println("🔐 Roles received: " + registrationRequest.getRoles());
        System.out.println("🔐 Password received: " + (registrationRequest.getPassword() != null ? "***" : "NULL"));
        System.out.println("🔐 Full registration request: " + registrationRequest.toString());

        // Validate request data
        if (registrationRequest.getUsername() == null || registrationRequest.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required!");
        }

        if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
            System.err.println("❌ ERROR: Password is null or empty!");
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
        System.out.println("✅ User registered successfully: " + savedUser.getUsername() + " with roles: " + savedUser.getRoles());
        return ResponseEntity.ok("User registered successfully!");
    }

    // ✅ Login endpoint (unchanged)
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

        return ResponseEntity.ok(new JwtResponse(token, roles));
    }
}