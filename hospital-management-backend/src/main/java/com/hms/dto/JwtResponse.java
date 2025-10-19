package com.hms.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private Long id;           // ✅ ADD THIS
    private String username;   // ✅ ADD THIS
    private List<String> roles;

    // Constructor with all fields
    public JwtResponse(String token, Long id, String username, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.roles = roles;
    }

    // Constructor with token only (for backward compatibility)
    public JwtResponse(String token) {
        this.token = token;
    }

    // Constructor with token and roles (for backward compatibility)
    public JwtResponse(String token, List<String> roles) {
        this.token = token;
        this.roles = roles;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}