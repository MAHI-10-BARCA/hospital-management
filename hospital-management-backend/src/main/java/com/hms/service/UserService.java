package com.hms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hms.entity.User;
import com.hms.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public User updateUser(String username, User userDetails) {
        User existingUser = getUserByUsername(username);
        // Update fields that are allowed to be changed
        // For simplicity, we'll allow name/email, but not username or password here.
        // Add more fields as necessary from your User entity.
        // e.g., existingUser.setEmail(userDetails.getEmail());
        return userRepository.save(existingUser);
    }

    public void deleteUser(String username) {
        User user = getUserByUsername(username);
        userRepository.delete(user);
    }
}