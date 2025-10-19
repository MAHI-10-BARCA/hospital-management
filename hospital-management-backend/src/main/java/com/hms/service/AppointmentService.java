package com.hms.service;

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
import com.hms.entity.User;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorScheduleRepository;
import com.hms.repository.PatientRepository;
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
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    public Appointment createAppointment(Appointment appointment, String userRole, String username) {
        System.out.println("🔄 Creating appointment for user: " + username + " with role: " + userRole);
        System.out.println("📋 Appointment data - Patient: " + appointment.getPatient() + 
                         ", Doctor: " + appointment.getDoctor() + 
                         ", Schedule: " + appointment.getSchedule() +
                         ", Reason: " + appointment.getReason());
        
        // Validate required fields
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new RuntimeException("Patient is required");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            throw new RuntimeException("Doctor is required");
        }
        if (appointment.getSchedule() == null || appointment.getSchedule().getId() == null) {
            throw new RuntimeException("Schedule is required");
        }
        if (appointment.getReason() == null || appointment.getReason().trim().isEmpty()) {
            throw new RuntimeException("Appointment reason is required");
        }

        // Get the actual entities from database
        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + appointment.getPatient().getId()));
        
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + appointment.getDoctor().getId()));
        
        DoctorSchedule schedule = doctorScheduleRepository.findById(appointment.getSchedule().getId())
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + appointment.getSchedule().getId()));

        System.out.println("📊 Schedule details: " + schedule);
        System.out.println("🔍 Checking schedule availability...");

        // Authorization check
        if ("PATIENT".equals(userRole)) {
            // Patient can only book for themselves
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Patient currentPatient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            
            if (!currentPatient.getId().equals(patient.getId())) {
                throw new RuntimeException("Patients can only book appointments for themselves");
            }
        }

        // Check if schedule is available
        if (!schedule.isAvailable()) {
            throw new RuntimeException("This time slot is fully booked. Current bookings: " + 
                                     schedule.getCurrentBookings() + "/" + schedule.getMaxPatients());
        }

        // Set the actual entities
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);
        appointment.setStatus("SCHEDULED");
        // Reason is already set from request

        // Book the slot
        schedule.bookSlot();
        doctorScheduleRepository.save(schedule);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        System.out.println("✅ Appointment created with ID: " + savedAppointment.getId());
        System.out.println("📊 Schedule updated - Bookings: " + schedule.getCurrentBookings() + "/" + schedule.getMaxPatients());
        
        return savedAppointment;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // ✅ ADDED: Get appointments with DTO for better frontend display
    public List<AppointmentResponseDTO> getAllAppointmentsWithDetails() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    // ✅ ADDED: Get appointment with details by ID
    public Optional<AppointmentResponseDTO> getAppointmentWithDetailsById(Long id) {
        return appointmentRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsForCurrentPatient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return appointmentRepository.findByPatientId(patient.getId());
    }

    // ✅ ADDED: Get appointments for current patient with details
    public List<AppointmentResponseDTO> getAppointmentsForCurrentPatientWithDetails(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId());
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<Appointment> getAppointmentsForCurrentDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return appointmentRepository.findByDoctorId(doctor.getId());
    }

    // ✅ ADDED: Get appointments for current doctor with details
    public List<AppointmentResponseDTO> getAppointmentsForCurrentDoctorWithDetails(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctor.getId());
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Appointment updateAppointmentStatus(Long id, String status, String userRole, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Authorization check
        if ("DOCTOR".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("Doctors can only update their own appointments");
            }
        }

        // Validate status
        if (!isValidStatus(status)) {
            throw new RuntimeException("Invalid status: " + status);
        }

        String oldStatus = appointment.getStatus();
        appointment.setStatus(status);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        System.out.println("✅ Appointment status updated from " + oldStatus + " to " + status);
        
        return updatedAppointment;
    }

    // ✅ ADDED: Update appointment with full details
    public Appointment updateAppointment(Long id, Appointment appointmentDetails, String userRole, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Authorization check
        if ("DOCTOR".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("Doctors can only update their own appointments");
            }
        }

        // Update fields
        if (appointmentDetails.getReason() != null) {
            appointment.setReason(appointmentDetails.getReason());
        }
        if (appointmentDetails.getStatus() != null && isValidStatus(appointmentDetails.getStatus())) {
            appointment.setStatus(appointmentDetails.getStatus());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        System.out.println("✅ Appointment updated: " + updatedAppointment.getId());
        
        return updatedAppointment;
    }

    public void cancelAppointment(Long id, String userRole, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        System.out.println("❌ Cancelling appointment: " + id);

        // Authorization check
        if ("PATIENT".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Patient currentPatient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            
            if (!appointment.getPatient().getId().equals(currentPatient.getId())) {
                throw new RuntimeException("Patients can only cancel their own appointments");
            }
        } else if ("DOCTOR".equals(userRole)) {
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            
            if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new RuntimeException("Doctors can only cancel their own appointments");
            }
        }

        // Free up the schedule slot
        DoctorSchedule schedule = appointment.getSchedule();
        schedule.cancelBooking();
        doctorScheduleRepository.save(schedule);

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);
        
        System.out.println("✅ Appointment cancelled successfully: " + id);
        System.out.println("📊 Schedule updated - Bookings: " + schedule.getCurrentBookings() + "/" + schedule.getMaxPatients());
    }

    public void deleteAppointment(Long id, String userRole, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        System.out.println("🗑️ Deleting appointment: " + id);

        // Only ADMIN can delete appointments
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Only administrators can delete appointments");
        }

        // Free up the schedule if appointment was active
        if (!"CANCELLED".equals(appointment.getStatus())) {
            DoctorSchedule schedule = appointment.getSchedule();
            schedule.cancelBooking();
            doctorScheduleRepository.save(schedule);
            System.out.println("📊 Freed up schedule slot");
        }

        appointmentRepository.delete(appointment);
        System.out.println("✅ Appointment deleted successfully: " + id);
    }

    // ✅ ADDED: Helper method to convert Appointment to DTO
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
        
        // Appointment details
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setCreatedDate(appointment.getCreatedDate());
        
        return dto;
    }

    // ✅ ADDED: Validate appointment status
    private boolean isValidStatus(String status) {
        return List.of("SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED").contains(status);
    }

    // ✅ ADDED: Method to get appointment statistics
    public String getAppointmentStats() {
        long totalAppointments = appointmentRepository.count();
        long scheduledAppointments = appointmentRepository.findByStatus("SCHEDULED").size();
        long confirmedAppointments = appointmentRepository.findByStatus("CONFIRMED").size();
        long inProgressAppointments = appointmentRepository.findByStatus("IN_PROGRESS").size();
        long completedAppointments = appointmentRepository.findByStatus("COMPLETED").size();
        long cancelledAppointments = appointmentRepository.findByStatus("CANCELLED").size();
        
        return String.format("Total: %d, Scheduled: %d, Confirmed: %d, In Progress: %d, Completed: %d, Cancelled: %d", 
                           totalAppointments, scheduledAppointments, confirmedAppointments, 
                           inProgressAppointments, completedAppointments, cancelledAppointments);
    }

    // ✅ ADDED: Get appointments by status
    public List<AppointmentResponseDTO> getAppointmentsByStatus(String status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}