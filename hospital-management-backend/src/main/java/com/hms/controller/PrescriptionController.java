package com.hms.controller;

import com.hms.dto.PrescriptionRequestDTO;
import com.hms.dto.PrescriptionResponseDTO;
import com.hms.entity.Prescription;
import com.hms.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<PrescriptionResponseDTO>> getMyPrescriptions(Authentication authentication) {
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