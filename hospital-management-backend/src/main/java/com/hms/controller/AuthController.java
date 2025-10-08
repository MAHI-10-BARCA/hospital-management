package com.hms.controller;

import com.hms.dto.JwtRequest; // We need to create this DTO
import com.hms.dto.JwtResponse; // and this one too
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

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
            roles.add("USER");
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
        final String token = jwtUtil.generateToken(userDetails);

        // Return the token in the response
        return ResponseEntity.ok(new JwtResponse(token));
    }
}