package com.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    private String gender;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ ADDED: Enhanced patient medical profile fields
    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "height")
    private Double height; // in cm

    @Column(name = "weight")
    private Double weight; // in kg

    @Column(name = "allergies", length = 1000)
    private String allergies;

    @Column(name = "current_medications", length = 1000)
    private String currentMedications;

    @Column(name = "past_medical_history", length = 2000)
    private String pastMedicalHistory;

    @Column(name = "family_medical_history", length = 2000)
    private String familyMedicalHistory;

    @Column(name = "primary_physician")
    private String primaryPhysician;

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_policy_number")
    private String insurancePolicyNumber;

    @Column(name = "insurance_group_number")
    private String insuranceGroupNumber;

    @Column(name = "emergency_medical_conditions", length = 1000)
    private String emergencyMedicalConditions;

    @Column(name = "preferred_pharmacy")
    private String preferredPharmacy;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "occupation")
    private String occupation;

    public Patient() {}

    public Patient(String name, int age, String gender, User user) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.user = user;
    }

    public Patient(String name, int age, String gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.user = null;
    }

    // Getters and Setters for new fields
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getCurrentMedications() { return currentMedications; }
    public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }

    public String getPastMedicalHistory() { return pastMedicalHistory; }
    public void setPastMedicalHistory(String pastMedicalHistory) { this.pastMedicalHistory = pastMedicalHistory; }

    public String getFamilyMedicalHistory() { return familyMedicalHistory; }
    public void setFamilyMedicalHistory(String familyMedicalHistory) { this.familyMedicalHistory = familyMedicalHistory; }

    public String getPrimaryPhysician() { return primaryPhysician; }
    public void setPrimaryPhysician(String primaryPhysician) { this.primaryPhysician = primaryPhysician; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String insuranceGroupNumber) { this.insuranceGroupNumber = insuranceGroupNumber; }

    public String getEmergencyMedicalConditions() { return emergencyMedicalConditions; }
    public void setEmergencyMedicalConditions(String emergencyMedicalConditions) { this.emergencyMedicalConditions = emergencyMedicalConditions; }

    public String getPreferredPharmacy() { return preferredPharmacy; }
    public void setPreferredPharmacy(String preferredPharmacy) { this.preferredPharmacy = preferredPharmacy; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    // ... existing getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}