package com.hms.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private List<String> roles; // ✅ Added roles field

    // Constructor with token only (optional, can still be used)
    public JwtResponse(String token) {
        this.token = token;
    }

    // Constructor with token and roles
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
