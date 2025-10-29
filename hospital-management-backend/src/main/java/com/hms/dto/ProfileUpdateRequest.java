package com.hms.dto;

public class ProfileUpdateRequest {
    private String type; // "user", "doctor", "patient"
    private UserProfileDTO userData;
    private DoctorProfileDTO doctorData;
    private PatientProfileDTO patientData;

    // Constructors
    public ProfileUpdateRequest() {}

    public ProfileUpdateRequest(String type, UserProfileDTO userData, DoctorProfileDTO doctorData, PatientProfileDTO patientData) {
        this.type = type;
        this.userData = userData;
        this.doctorData = doctorData;
        this.patientData = patientData;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserProfileDTO getUserData() {
        return userData;
    }

    public void setUserData(UserProfileDTO userData) {
        this.userData = userData;
    }

    public DoctorProfileDTO getDoctorData() {
        return doctorData;
    }

    public void setDoctorData(DoctorProfileDTO doctorData) {
        this.doctorData = doctorData;
    }

    public PatientProfileDTO getPatientData() {
        return patientData;
    }

    public void setPatientData(PatientProfileDTO patientData) {
        this.patientData = patientData;
    }
}