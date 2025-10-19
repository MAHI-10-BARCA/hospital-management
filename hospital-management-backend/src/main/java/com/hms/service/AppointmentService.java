package com.hms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.dto.AppointmentResponseDTO;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.DoctorSchedule;
import com.hms.entity.Patient;
import com.hms.entity.Prescription;
import com.hms.entity.User;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorScheduleRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.PrescriptionRepository;
import com.hms.repository.UserRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public List<AppointmentResponseDTO> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return convertToDTO(appointment);
    }

    public AppointmentResponseDTO createAppointment(Appointment appointment) {
        // Validate entities exist
        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        DoctorSchedule schedule = scheduleRepository.findById(appointment.getSchedule().getId())
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Check if the schedule is available using isAvailable() method
        if (!schedule.isAvailable()) {
            throw new RuntimeException("Selected schedule is not available");
        }

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);

        // Book the schedule slot
        schedule.bookSlot();
        scheduleRepository.save(schedule);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(savedAppointment);
    }

    public AppointmentResponseDTO updateAppointmentStatus(Long id, String status, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Authorization check for doctors when completing appointments
        if ("COMPLETED".equals(status)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("You can only update status for your own appointments");
            }
        }

        appointment.setStatus(status);
        appointment.setUpdatedDate(LocalDateTime.now());

        // If status is completed, ensure prescription is accessible to patient
        if ("COMPLETED".equals(status)) {
            Optional<Prescription> existingPrescription = prescriptionRepository.findByAppointmentId(id);
            if (existingPrescription.isPresent()) {
                System.out.println("✅ Prescription is now accessible to patient for appointment: " + id);
            } else {
                System.out.println("ℹ️ No prescription found for completed appointment: " + id);
            }
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(savedAppointment);
    }

    public AppointmentResponseDTO updateAppointment(Long id, Appointment appointmentUpdates) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointmentUpdates.getReason() != null) {
            appointment.setReason(appointmentUpdates.getReason());
        }
        if (appointmentUpdates.getStatus() != null) {
            appointment.setStatus(appointmentUpdates.getStatus());
        }

        appointment.setUpdatedDate(LocalDateTime.now());
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(savedAppointment);
    }

    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // Free up the schedule when appointment is deleted
        DoctorSchedule schedule = appointment.getSchedule();
        if (schedule != null) {
            schedule.cancelBooking();
            scheduleRepository.save(schedule);
        }
        
        appointmentRepository.delete(appointment);
    }

    public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponseDTO> getAppointmentsByStatus(String status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Additional helper methods for user-specific appointments
    public List<AppointmentResponseDTO> getAppointmentsForCurrentPatient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        
        return getAppointmentsByPatient(patient.getId());
    }

    public List<AppointmentResponseDTO> getAppointmentsForCurrentDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        
        return getAppointmentsByDoctor(doctor.getId());
    }

    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        
        // Patient details
        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
            dto.setPatientName(appointment.getPatient().getName());
        }
        
        // Doctor details
        if (appointment.getDoctor() != null) {
            dto.setDoctorId(appointment.getDoctor().getId());
            dto.setDoctorName(appointment.getDoctor().getName());
            dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        }
        
        // Schedule details
        if (appointment.getSchedule() != null) {
            dto.setScheduleId(appointment.getSchedule().getId());
            dto.setAppointmentDate(appointment.getSchedule().getAvailableDate());
            dto.setStartTime(appointment.getSchedule().getStartTime());
            dto.setEndTime(appointment.getSchedule().getEndTime());
        }
        
        // Use direct date/time fields as fallback
        if (dto.getAppointmentDate() == null) {
            dto.setAppointmentDate(appointment.getAppointmentDate());
        }
        if (dto.getStartTime() == null) {
            dto.setStartTime(appointment.getAppointmentTime());
        }
        
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setCreatedDate(appointment.getCreatedDate());
        
        return dto;
    }
}