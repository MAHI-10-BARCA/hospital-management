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

    @Autowired
    private PatientService patientService;

    // ✅ FIXED: Add role-based filtering for appointments
    public List<AppointmentResponseDTO> getAllAppointments(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Appointment> appointments;
        
        // Role-based data filtering
        if (currentUser.getRoles().contains("ROLE_ADMIN")) {
            // Admin sees all appointments
            appointments = appointmentRepository.findAll();
            System.out.println("👑 ADMIN: Returning all " + appointments.size() + " appointments");
        } else if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            // Doctor sees only their appointments
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            appointments = appointmentRepository.findByDoctorId(doctor.getId());
            System.out.println("👨‍⚕️ DOCTOR: Returning " + appointments.size() + " appointments for doctor ID: " + doctor.getId());
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            // Patient sees only their appointments
            Patient patient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            appointments = appointmentRepository.findByPatientId(patient.getId());
            System.out.println("👤 PATIENT: Returning " + appointments.size() + " appointments for patient ID: " + patient.getId());
        } else {
            throw new RuntimeException("Unauthorized access");
        }
        
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO getAppointmentById(Long id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // ✅ ADDED: Authorization check
        if (!hasAccessToAppointment(appointment, username)) {
            throw new RuntimeException("Access denied to this appointment");
        }
        
        return convertToDTO(appointment);
    }

    public AppointmentResponseDTO createAppointment(Appointment appointment, String username) {
        System.out.println("📅 Creating appointment for user: " + username);
        
        // ✅ FIXED: Auto-create patient profile if needed
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Patient patient;
        if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            // For patients, use their own profile
            patient = patientService.getOrCreatePatientForUser(currentUser.getId());
            appointment.setPatient(patient);
            System.out.println("✅ Using patient ID: " + patient.getId() + " for user: " + username);
        } else {
            // For admins/doctors creating appointments, validate the patient exists
            if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
                throw new RuntimeException("Patient ID is required");
            }
            patient = patientRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + appointment.getPatient().getId()));
            System.out.println("✅ Using specified patient ID: " + patient.getId());
        }

        // ✅ FIXED: Better doctor validation with detailed logging
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            throw new RuntimeException("Doctor ID is required");
        }
        
        Long doctorId = appointment.getDoctor().getId();
        System.out.println("🔍 Looking for doctor with ID: " + doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    System.err.println("❌ Doctor not found with ID: " + doctorId);
                    // List available doctors for debugging
                    List<Doctor> allDoctors = doctorRepository.findAll();
                    System.err.println("📋 Available doctors: " + allDoctors.stream()
                            .map(d -> "ID: " + d.getId() + ", Name: " + d.getName())
                            .collect(Collectors.joining(", ")));
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
                });
        
        System.out.println("✅ Found doctor: " + doctor.getName() + " (ID: " + doctor.getId() + ")");

        // ✅ FIXED: Better schedule validation
        if (appointment.getSchedule() == null || appointment.getSchedule().getId() == null) {
            throw new RuntimeException("Schedule ID is required");
        }
        
        Long scheduleId = appointment.getSchedule().getId();
        System.out.println("🔍 Looking for schedule with ID: " + scheduleId);
        
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> {
                    System.err.println("❌ Schedule not found with ID: " + scheduleId);
                    return new RuntimeException("Schedule not found with ID: " + scheduleId);
                });

        // Check if the schedule belongs to the specified doctor
        if (!schedule.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Schedule does not belong to the specified doctor");
        }

        // Check if the schedule is available using isAvailable() method
        if (!schedule.isAvailable()) {
            throw new RuntimeException("Selected schedule is not available");
        }

        System.out.println("✅ Schedule is available: " + schedule.getId());

        // Set the entities
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);
        appointment.setStatus("SCHEDULED");
        appointment.setCreatedDate(LocalDateTime.now());

        // Book the schedule slot
        schedule.bookSlot();
        scheduleRepository.save(schedule);
        System.out.println("✅ Booked schedule slot: " + schedule.getId());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        System.out.println("✅ Appointment created successfully with ID: " + savedAppointment.getId());
        
        return convertToDTO(savedAppointment);
    }

    public AppointmentResponseDTO updateAppointmentStatus(Long id, String status, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // ✅ ADDED: Authorization check
        if (!hasAccessToAppointment(appointment, username)) {
            throw new RuntimeException("Access denied to this appointment");
        }

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

    public AppointmentResponseDTO updateAppointment(Long id, Appointment appointmentUpdates, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // ✅ ADDED: Authorization check
        if (!hasAccessToAppointment(appointment, username)) {
            throw new RuntimeException("Access denied to this appointment");
        }

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

    public void deleteAppointment(Long id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // ✅ ADDED: Authorization check
        if (!hasAccessToAppointment(appointment, username)) {
            throw new RuntimeException("Access denied to this appointment");
        }
        
        // Free up the schedule when appointment is deleted
        DoctorSchedule schedule = appointment.getSchedule();
        if (schedule != null) {
            schedule.cancelBooking();
            scheduleRepository.save(schedule);
        }
        
        appointmentRepository.delete(appointment);
    }

    public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId, String username) {
        // ✅ ADDED: Authorization check - patients can only see their own appointments
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Patient currentPatient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            if (!patientId.equals(currentPatient.getId())) {
                throw new RuntimeException("Patients can only view their own appointments");
            }
        }
        
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId, String username) {
        // ✅ ADDED: Authorization check - doctors can only see their own appointments
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            Doctor currentDoctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            if (!doctorId.equals(currentDoctor.getId())) {
                throw new RuntimeException("Doctors can only view their own appointments");
            }
        }
        
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponseDTO> getAppointmentsByStatus(String status, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Appointment> appointments;
        
        // Role-based filtering
        if (currentUser.getRoles().contains("ROLE_ADMIN")) {
            appointments = appointmentRepository.findByStatus(status);
        } else if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            appointments = appointmentRepository.findByDoctorIdAndStatus(doctor.getId(), status);
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Patient patient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            appointments = appointmentRepository.findByPatientIdAndStatus(patient.getId(), status);
        } else {
            throw new RuntimeException("Unauthorized access");
        }
        
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ ADDED: Authorization helper method
    private boolean hasAccessToAppointment(Appointment appointment, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getRoles().contains("ROLE_ADMIN")) {
            return true; // Admin can access all appointments
        } else if (currentUser.getRoles().contains("ROLE_DOCTOR")) {
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            return appointment.getDoctor().getId().equals(doctor.getId());
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Patient patient = patientRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            return appointment.getPatient().getId().equals(patient.getId());
        }
        
        return false;
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