package com.hms.controller;

import java.util.HashSet; // We need to create this DTO
import java.util.Set; // and this one too

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.JwtRequest;
import com.hms.dto.JwtResponse;
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.util.JwtUtil;

@RestController
@RequestMapping("/auth") // Changed from /api/auth to match your SecurityConfig
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

    // Your existing registration endpoint - no changes needed
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");
            user.setRoles(roles);
        }
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    // NEW: JWT Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> createAuthenticationToken(@RequestBody JwtRequest authenticationRequest) throws Exception {
        // Authenticate the user with username and password
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                authenticationRequest.username(), authenticationRequest.password()));

        // If authentication is successful, load user details and generate a token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.username());
        String token = jwtUtil.generateToken(userDetails.getUsername());


        // Return the token in the response
        return ResponseEntity.ok(new JwtResponse(token));
    }
}