package com.hms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.DoctorProfileDTO;
import com.hms.dto.PatientProfileDTO;
import com.hms.dto.UserProfileDTO;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.service.DoctorService;
import com.hms.service.PatientService;
import com.hms.service.UserService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.getUserByUsername(username);
            
            // Convert to DTO
            UserProfileDTO userProfileDTO = convertToUserProfileDTO(user);
            
            // Check role and return appropriate profile
            if (user.getRoles().contains("ROLE_DOCTOR")) {
                Doctor doctor = doctorService.getCurrentDoctor(username);
                DoctorProfileDTO doctorProfile = convertToDoctorProfileDTO(doctor, userProfileDTO);
                return ResponseEntity.ok(doctorProfile);
            } else if (user.getRoles().contains("ROLE_PATIENT")) {
                Patient patient = patientService.getCurrentPatient(username);
                PatientProfileDTO patientProfile = convertToPatientProfileDTO(patient, userProfileDTO);
                return ResponseEntity.ok(patientProfile);
            } else {
                // Admin or other roles
                return ResponseEntity.ok(userProfileDTO);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Profile error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    @PutMapping("/user")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileDTO userProfileDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            User updatedUser = userService.updateUserProfile(username, userProfileDTO);
            UserProfileDTO updatedProfile = convertToUserProfileDTO(updatedUser);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }

    @PutMapping("/doctor")
    public ResponseEntity<?> updateDoctorProfile(@RequestBody DoctorProfileDTO doctorProfileDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            Doctor updatedDoctor = doctorService.updateDoctorProfile(username, doctorProfileDTO);
            User user = userService.getUserByUsername(username);
            DoctorProfileDTO updatedProfile = convertToDoctorProfileDTO(updatedDoctor, convertToUserProfileDTO(user));
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating doctor profile: " + e.getMessage());
        }
    }

    @PutMapping("/patient")
    public ResponseEntity<?> updatePatientProfile(@RequestBody PatientProfileDTO patientProfileDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            Patient updatedPatient = patientService.updatePatientProfile(username, patientProfileDTO);
            User user = userService.getUserByUsername(username);
            PatientProfileDTO updatedProfile = convertToPatientProfileDTO(updatedPatient, convertToUserProfileDTO(user));
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating patient profile: " + e.getMessage());
        }
    }

    // Helper methods to convert entities to DTOs
    private UserProfileDTO convertToUserProfileDTO(User user) {
        return new UserProfileDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.getGender(),
            user.getAddress(),
            user.getCity(),
            user.getState(),
            user.getZipCode(),
            user.getCountry(),
            user.getProfileImage(),
            user.getBio(),
            user.getEmergencyContactName(),
            user.getEmergencyContactPhone(),
            user.getRoles(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    private DoctorProfileDTO convertToDoctorProfileDTO(Doctor doctor, UserProfileDTO userProfile) {
        DoctorProfileDTO dto = new DoctorProfileDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setContact(doctor.getContact());
        dto.setUserProfile(userProfile);
        dto.setQualifications(doctor.getQualifications());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setLicenseNumber(doctor.getLicenseNumber());
        dto.setDepartment(doctor.getDepartment());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setLanguagesSpoken(doctor.getLanguagesSpoken());
        dto.setAwardsHonors(doctor.getAwardsHonors());
        dto.setProfessionalBio(doctor.getProfessionalBio());
        dto.setOfficeLocation(doctor.getOfficeLocation());
        dto.setOfficeHours(doctor.getOfficeHours());
        return dto;
    }

    private PatientProfileDTO convertToPatientProfileDTO(Patient patient, UserProfileDTO userProfile) {
        PatientProfileDTO dto = new PatientProfileDTO();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setUserProfile(userProfile);
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setHeight(patient.getHeight());
        dto.setWeight(patient.getWeight());
        dto.setAllergies(patient.getAllergies());
        dto.setCurrentMedications(patient.getCurrentMedications());
        dto.setPastMedicalHistory(patient.getPastMedicalHistory());
        dto.setFamilyMedicalHistory(patient.getFamilyMedicalHistory());
        dto.setPrimaryPhysician(patient.getPrimaryPhysician());
        dto.setInsuranceProvider(patient.getInsuranceProvider());
        dto.setInsurancePolicyNumber(patient.getInsurancePolicyNumber());
        dto.setInsuranceGroupNumber(patient.getInsuranceGroupNumber());
        dto.setEmergencyMedicalConditions(patient.getEmergencyMedicalConditions());
        dto.setPreferredPharmacy(patient.getPreferredPharmacy());
        dto.setMaritalStatus(patient.getMaritalStatus());
        dto.setOccupation(patient.getOccupation());
        return dto;
    }
}