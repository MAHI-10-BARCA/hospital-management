package com.hms.dto;

public class PatientProfileDTO {
    private Long id;
    private String name;
    private int age;
    private String gender;
    private UserProfileDTO userProfile;
    private String bloodGroup;
    private Double height;
    private Double weight;
    private String allergies;
    private String currentMedications;
    private String pastMedicalHistory;
    private String familyMedicalHistory;
    private String primaryPhysician;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private String emergencyMedicalConditions;
    private String preferredPharmacy;
    private String maritalStatus;
    private String occupation;

    // Constructors
    public PatientProfileDTO() {}

    public PatientProfileDTO(Long id, String name, int age, String gender, UserProfileDTO userProfile, 
                            String bloodGroup, Double height, Double weight, String allergies, 
                            String currentMedications, String pastMedicalHistory, String familyMedicalHistory, 
                            String primaryPhysician, String insuranceProvider, String insurancePolicyNumber, 
                            String insuranceGroupNumber, String emergencyMedicalConditions, 
                            String preferredPharmacy, String maritalStatus, String occupation) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.userProfile = userProfile;
        this.bloodGroup = bloodGroup;
        this.height = height;
        this.weight = weight;
        this.allergies = allergies;
        this.currentMedications = currentMedications;
        this.pastMedicalHistory = pastMedicalHistory;
        this.familyMedicalHistory = familyMedicalHistory;
        this.primaryPhysician = primaryPhysician;
        this.insuranceProvider = insuranceProvider;
        this.insurancePolicyNumber = insurancePolicyNumber;
        this.insuranceGroupNumber = insuranceGroupNumber;
        this.emergencyMedicalConditions = emergencyMedicalConditions;
        this.preferredPharmacy = preferredPharmacy;
        this.maritalStatus = maritalStatus;
        this.occupation = occupation;
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

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public UserProfileDTO getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileDTO userProfile) {
        this.userProfile = userProfile;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getCurrentMedications() {
        return currentMedications;
    }

    public void setCurrentMedications(String currentMedications) {
        this.currentMedications = currentMedications;
    }

    public String getPastMedicalHistory() {
        return pastMedicalHistory;
    }

    public void setPastMedicalHistory(String pastMedicalHistory) {
        this.pastMedicalHistory = pastMedicalHistory;
    }

    public String getFamilyMedicalHistory() {
        return familyMedicalHistory;
    }

    public void setFamilyMedicalHistory(String familyMedicalHistory) {
        this.familyMedicalHistory = familyMedicalHistory;
    }

    public String getPrimaryPhysician() {
        return primaryPhysician;
    }

    public void setPrimaryPhysician(String primaryPhysician) {
        this.primaryPhysician = primaryPhysician;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public String getInsurancePolicyNumber() {
        return insurancePolicyNumber;
    }

    public void setInsurancePolicyNumber(String insurancePolicyNumber) {
        this.insurancePolicyNumber = insurancePolicyNumber;
    }

    public String getInsuranceGroupNumber() {
        return insuranceGroupNumber;
    }

    public void setInsuranceGroupNumber(String insuranceGroupNumber) {
        this.insuranceGroupNumber = insuranceGroupNumber;
    }

    public String getEmergencyMedicalConditions() {
        return emergencyMedicalConditions;
    }

    public void setEmergencyMedicalConditions(String emergencyMedicalConditions) {
        this.emergencyMedicalConditions = emergencyMedicalConditions;
    }

    public String getPreferredPharmacy() {
        return preferredPharmacy;
    }

    public void setPreferredPharmacy(String preferredPharmacy) {
        this.preferredPharmacy = preferredPharmacy;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(String maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }
}