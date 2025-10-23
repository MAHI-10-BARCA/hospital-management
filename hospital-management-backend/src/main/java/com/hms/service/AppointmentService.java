package com.hms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
@Transactional
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

    @Autowired
    private DoctorService doctorService;

    // ✅ FIXED: Constructor with all dependencies to avoid autowiring issues
    public AppointmentService(AppointmentRepository appointmentRepository,
                            PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            DoctorScheduleRepository scheduleRepository,
                            UserRepository userRepository,
                            PrescriptionRepository prescriptionRepository,
                            PatientService patientService,
                            DoctorService doctorService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

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
            // Doctor sees only their appointments - USE AUTO-CREATING METHOD
            Doctor doctor = doctorService.getCurrentDoctor(username);
            appointments = appointmentRepository.findByDoctorId(doctor.getId());
            System.out.println("👨‍⚕️ DOCTOR: Returning " + appointments.size() + " appointments for doctor ID: " + doctor.getId());
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            // Patient sees only their appointments - USE AUTO-CREATING METHOD
            Patient patient = patientService.getCurrentPatient(username);
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

    // ✅ COMPLETELY REWRITTEN: Enhanced appointment creation with better error handling
    public AppointmentResponseDTO createAppointment(Appointment appointment, String username) {
        System.out.println("📅 Creating appointment for user: " + username);
        System.out.println("🔍 Initial appointment data: " + appointment);
        
        try {
            // ✅ FIXED: Auto-create patient profile if needed with better error handling
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            Patient patient;
            if (currentUser.getRoles().contains("ROLE_PATIENT")) {
                try {
                    patient = patientService.getCurrentPatient(username);
                    System.out.println("✅ Using patient ID: " + patient.getId() + " for user: " + username);
                } catch (Exception e) {
                    System.err.println("❌ Error getting patient profile: " + e.getMessage());
                    throw new RuntimeException("Unable to access patient profile. Please complete your profile setup.");
                }
            } else {
                // For admins/doctors creating appointments, use the provided patient
                if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
                    throw new RuntimeException("Patient ID is required");
                }
                patient = patientRepository.findById(appointment.getPatient().getId())
                        .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + appointment.getPatient().getId()));
                System.out.println("✅ Using specified patient ID: " + patient.getId());
            }

            // ✅ FIXED: Enhanced doctor validation
            if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
                throw new RuntimeException("Doctor selection is required");
            }
            
            Long doctorId = appointment.getDoctor().getId();
            System.out.println("🔍 Validating doctor with ID: " + doctorId);
            
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> {
                        System.err.println("❌ Doctor not found with ID: " + doctorId);
                        return new RuntimeException("Selected doctor is not available. Please choose another doctor.");
                    });
            
            System.out.println("✅ Doctor validated: " + doctor.getName());

            // ✅ FIXED: Enhanced schedule validation
            if (appointment.getSchedule() == null || appointment.getSchedule().getId() == null) {
                throw new RuntimeException("Appointment time selection is required");
            }
            
            Long scheduleId = appointment.getSchedule().getId();
            System.out.println("🔍 Validating schedule with ID: " + scheduleId);
            
            DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> {
                        System.err.println("❌ Schedule not found with ID: " + scheduleId);
                        return new RuntimeException("Selected time slot is no longer available. Please choose another time.");
                    });

            // Check schedule availability and ownership
            if (!schedule.getDoctor().getId().equals(doctorId)) {
                throw new RuntimeException("Selected time slot does not belong to the chosen doctor");
            }

            if (!schedule.isAvailable()) {
                throw new RuntimeException("Selected time slot is fully booked. Please choose another available time.");
            }

            System.out.println("✅ Schedule validated and available");

            // ✅ FIXED: Create new appointment with proper entity relationships
            Appointment newAppointment = new Appointment();
            newAppointment.setPatient(patient);
            newAppointment.setDoctor(doctor);
            newAppointment.setSchedule(schedule);
            newAppointment.setReason(appointment.getReason());
            newAppointment.setStatus("SCHEDULED");
            newAppointment.setCreatedDate(LocalDateTime.now());
            newAppointment.setUpdatedDate(LocalDateTime.now());

            // Book the schedule slot
            try {
                schedule.bookSlot();
                scheduleRepository.save(schedule);
                System.out.println("✅ Schedule slot booked successfully");
            } catch (Exception e) {
                System.err.println("❌ Error booking schedule slot: " + e.getMessage());
                throw new RuntimeException("Failed to reserve the appointment time. Please try again.");
            }

            // Save appointment
            Appointment savedAppointment;
            try {
                savedAppointment = appointmentRepository.save(newAppointment);
                System.out.println("✅ Appointment created successfully with ID: " + savedAppointment.getId());
            } catch (Exception e) {
                System.err.println("❌ Error saving appointment: " + e.getMessage());
                // Rollback schedule booking
                schedule.cancelBooking();
                scheduleRepository.save(schedule);
                throw new RuntimeException("Failed to create appointment. Please try again.");
            }
            
            return convertToDTO(savedAppointment);
            
        } catch (RuntimeException e) {
            // Re-throw with clear message
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error creating appointment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("An unexpected error occurred. Please try again.");
        }
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
            Doctor currentDoctor = doctorService.getCurrentDoctor(username);

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
            Patient currentPatient = patientService.getCurrentPatient(username);
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
            Doctor currentDoctor = doctorService.getCurrentDoctor(username);
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
            Doctor doctor = doctorService.getCurrentDoctor(username);
            appointments = appointmentRepository.findByDoctorIdAndStatus(doctor.getId(), status);
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Patient patient = patientService.getCurrentPatient(username);
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
            Doctor doctor = doctorService.getCurrentDoctor(username);
            return appointment.getDoctor().getId().equals(doctor.getId());
        } else if (currentUser.getRoles().contains("ROLE_PATIENT")) {
            Patient patient = patientService.getCurrentPatient(username);
            return appointment.getPatient().getId().equals(patient.getId());
        }
        
        return false;
    }

    // ✅ IMPROVED: Better DTO conversion with null checks
    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        
        // Patient details
        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
            dto.setPatientName(appointment.getPatient().getName() != null ? 
                appointment.getPatient().getName() : "Unknown Patient");
        } else {
            dto.setPatientName("Unknown Patient");
        }
        
        // Doctor details
        if (appointment.getDoctor() != null) {
            dto.setDoctorId(appointment.getDoctor().getId());
            dto.setDoctorName(appointment.getDoctor().getName() != null ? 
                appointment.getDoctor().getName() : "Unknown Doctor");
            dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization() != null ? 
                appointment.getDoctor().getSpecialization() : "General");
        } else {
            dto.setDoctorName("Unknown Doctor");
            dto.setDoctorSpecialization("General");
        }
        
        // Schedule details
        if (appointment.getSchedule() != null) {
            dto.setScheduleId(appointment.getSchedule().getId());
            if (appointment.getSchedule().getAvailableDate() != null) {
                dto.setAppointmentDate(appointment.getSchedule().getAvailableDate());
            }
            if (appointment.getSchedule().getStartTime() != null) {
                dto.setStartTime(appointment.getSchedule().getStartTime());
            }
            if (appointment.getSchedule().getEndTime() != null) {
                dto.setEndTime(appointment.getSchedule().getEndTime());
            }
        }
        
        // Use direct date/time fields as fallback
        if (dto.getAppointmentDate() == null && appointment.getAppointmentDate() != null) {
            dto.setAppointmentDate(appointment.getAppointmentDate());
        }
        if (dto.getStartTime() == null && appointment.getAppointmentTime() != null) {
            dto.setStartTime(appointment.getAppointmentTime());
        }
        
        dto.setStatus(appointment.getStatus() != null ? appointment.getStatus() : "SCHEDULED");
        dto.setReason(appointment.getReason());
        dto.setCreatedDate(appointment.getCreatedDate());
        
        return dto;
    }
}