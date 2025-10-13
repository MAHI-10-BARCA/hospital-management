package com.hms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@CrossOrigin(origins = "*") // Configure for your frontend URL
public class ProfileController {

    @Autowired
    private UserService userService;

    // Endpoint for a user to get their own details
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    // Endpoint for a user to update their own details
    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody User userUpdateInfo) {
        User updatedUser = userService.updateUser(userDetails.getUsername(), userUpdateInfo);
        return ResponseEntity.ok(updatedUser);
    }
    
    // Endpoint for a user to delete their own account
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUserAccount(@AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}