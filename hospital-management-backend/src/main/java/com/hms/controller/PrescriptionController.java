package com.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.PrescriptionRequestDTO;
import com.hms.dto.PrescriptionResponseDTO;
import com.hms.entity.Prescription;
import com.hms.service.PrescriptionService;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<?> createPrescription(
            @RequestBody PrescriptionRequestDTO requestDTO,
            Authentication authentication) {
        
        System.out.println("💊 Creating prescription for appointment: " + requestDTO.getAppointmentId());
        String username = authentication.getName();
        
        try {
            Prescription prescription = prescriptionService.createPrescription(requestDTO, username);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        try {
            PrescriptionResponseDTO prescription = prescriptionService.getPrescriptionByAppointment(appointmentId);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ FIXED: Get prescription by appointment ID for patient
    @GetMapping("/appointment/{appointmentId}/patient")
    public ResponseEntity<?> getPrescriptionByAppointmentForPatient(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        
        String username = authentication.getName();
        System.out.println("👤 Patient " + username + " requesting prescription for appointment: " + appointmentId);
        
        try {
            PrescriptionResponseDTO prescription = prescriptionService.getPrescriptionByAppointmentForPatient(appointmentId, username);
            System.out.println("✅ Prescription found and returned to patient");
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting prescription for patient: " + e.getMessage());
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ✅ ADDED: Get all prescriptions for current patient (only completed appointments)
    @GetMapping("/patient/my-prescriptions")
    public ResponseEntity<?> getMyPrescriptions(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("👤 Patient " + username + " requesting their prescriptions");
        
        try {
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPatientPrescriptions(username);
            System.out.println("✅ Returning " + prescriptions.size() + " prescriptions to patient");
            return ResponseEntity.ok(prescriptions);
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting patient prescriptions: " + e.getMessage());
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // Legacy endpoint - kept for backward compatibility
    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<PrescriptionResponseDTO>> getMyPrescriptionsOld(Authentication authentication) {
        String username = authentication.getName();
        List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsForPatient(username);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/doctor-prescriptions")
    public ResponseEntity<List<PrescriptionResponseDTO>> getDoctorPrescriptions(Authentication authentication) {
        String username = authentication.getName();
        List<PrescriptionResponseDTO> prescriptions = prescriptionService.getPrescriptionsForDoctor(username);
        return ResponseEntity.ok(prescriptions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePrescription(
            @PathVariable Long id,
            @RequestBody PrescriptionRequestDTO requestDTO,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        try {
            Prescription prescription = prescriptionService.updatePrescription(id, requestDTO, username);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrescription(
            @PathVariable Long id,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        try {
            prescriptionService.deletePrescription(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}