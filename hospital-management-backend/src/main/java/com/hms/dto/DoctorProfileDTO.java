package com.hms.dto;

import java.math.BigDecimal;

public class DoctorProfileDTO {
    private Long id;
    private String name;
    private String specialization;
    private String contact;
    private UserProfileDTO userProfile;
    private String qualifications;
    private Integer experienceYears;
    private String licenseNumber;
    private String department;
    private BigDecimal consultationFee;
    private String languagesSpoken;
    private String awardsHonors;
    private String professionalBio;
    private String officeLocation;
    private String officeHours;

    // Constructors
    public DoctorProfileDTO() {}

    public DoctorProfileDTO(Long id, String name, String specialization, String contact, 
                           UserProfileDTO userProfile, String qualifications, Integer experienceYears, 
                           String licenseNumber, String department, BigDecimal consultationFee, 
                           String languagesSpoken, String awardsHonors, String professionalBio, 
                           String officeLocation, String officeHours) {
        this.id = id;
        this.name = name;
        this.specialization = specialization;
        this.contact = contact;
        this.userProfile = userProfile;
        this.qualifications = qualifications;
        this.experienceYears = experienceYears;
        this.licenseNumber = licenseNumber;
        this.department = department;
        this.consultationFee = consultationFee;
        this.languagesSpoken = languagesSpoken;
        this.awardsHonors = awardsHonors;
        this.professionalBio = professionalBio;
        this.officeLocation = officeLocation;
        this.officeHours = officeHours;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public UserProfileDTO getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileDTO userProfile) {
        this.userProfile = userProfile;
    }

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getLanguagesSpoken() {
        return languagesSpoken;
    }

    public void setLanguagesSpoken(String languagesSpoken) {
        this.languagesSpoken = languagesSpoken;
    }

    public String getAwardsHonors() {
        return awardsHonors;
    }

    public void setAwardsHonors(String awardsHonors) {
        this.awardsHonors = awardsHonors;
    }

    public String getProfessionalBio() {
        return professionalBio;
    }

    public void setProfessionalBio(String professionalBio) {
        this.professionalBio = professionalBio;
    }

    public String getOfficeLocation() {
        return officeLocation;
    }

    public void setOfficeLocation(String officeLocation) {
        this.officeLocation = officeLocation;
    }

    public String getOfficeHours() {
        return officeHours;
    }

    public void setOfficeHours(String officeHours) {
        this.officeHours = officeHours;
    }
}