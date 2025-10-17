package com.hms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.User;
import com.hms.service.UserService;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            // Get authentication from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("=== PROFILE DEBUG INFO ===");
            System.out.println("🔍 Authentication: " + authentication);
            System.out.println("🔍 Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
            System.out.println("🔍 Name: " + (authentication != null ? authentication.getName() : "null"));
            System.out.println("🔍 Authorities: " + (authentication != null ? authentication.getAuthorities() : "null"));
            System.out.println("🔍 Is authenticated: " + (authentication != null ? authentication.isAuthenticated() : "false"));
            
            if (authentication == null) {
                System.err.println("❌ Authentication is NULL");
                return ResponseEntity.status(401).body("Authentication is null");
            }
            
            if (!authentication.isAuthenticated()) {
                System.err.println("❌ Not authenticated");
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            if ("anonymousUser".equals(authentication.getPrincipal())) {
                System.err.println("❌ Anonymous user");
                return ResponseEntity.status(401).body("Anonymous user");
            }
            
            String username = authentication.getName();
            System.out.println("🔍 Profile request for user: " + username);
            
            User user = userService.getUserByUsername(username);
            System.out.println("✅ Found user: " + user.getUsername() + " with roles: " + user.getRoles());
            System.out.println("✅ User ID: " + user.getId());
            
            // FIX: Return User object directly (password is already @JsonIgnore'd in User entity)
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            System.err.println("❌ Profile error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    // Endpoint for a user to update their own details
    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUserProfile(@RequestBody User userUpdateInfo) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            User updatedUser = userService.updateUser(username, userUpdateInfo);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("❌ Profile update error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Endpoint for a user to delete their own account
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUserAccount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            userService.deleteUser(username);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Profile delete error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}