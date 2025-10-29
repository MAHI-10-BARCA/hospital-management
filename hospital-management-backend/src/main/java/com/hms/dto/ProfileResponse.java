package com.hms.dto;

public class ProfileResponse {
    private boolean success;
    private String message;
    private Object profile; // Can be UserProfileDTO, DoctorProfileDTO, or PatientProfileDTO

    // Constructors
    public ProfileResponse() {}

    public ProfileResponse(boolean success, String message, Object profile) {
        this.success = success;
        this.message = message;
        this.profile = profile;
    }

    public ProfileResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getProfile() {
        return profile;
    }

    public void setProfile(Object profile) {
        this.profile = profile;
    }

    // Helper methods for creating responses
    public static ProfileResponse success(String message, Object profile) {
        return new ProfileResponse(true, message, profile);
    }

    public static ProfileResponse error(String message) {
        return new ProfileResponse(false, message, null);
    }
}