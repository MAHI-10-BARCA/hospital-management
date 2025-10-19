package com.hms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                         ", Schedule: " + appointment.getSchedule());
        
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

        // ✅ UPDATED: Check if schedule is available using new method
        if (!schedule.isAvailable()) {
            throw new RuntimeException("This time slot is fully booked. Current bookings: " + 
                                     schedule.getCurrentBookings() + "/" + schedule.getMaxPatients());
        }

        // Set the actual entities
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);
        appointment.setStatus("SCHEDULED");

        // ✅ UPDATED: Book the slot (increment bookings instead of setting isBooked)
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

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
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

    public List<Appointment> getAppointmentsForCurrentDoctor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return appointmentRepository.findByDoctorId(doctor.getId());
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

        String oldStatus = appointment.getStatus();
        appointment.setStatus(status);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        System.out.println("✅ Appointment status updated from " + oldStatus + " to " + status);
        
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

        // ✅ UPDATED: Free up the schedule slot
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

        // ✅ UPDATED: Free up the schedule if appointment was active
        if (!"CANCELLED".equals(appointment.getStatus())) {
            DoctorSchedule schedule = appointment.getSchedule();
            schedule.cancelBooking();
            doctorScheduleRepository.save(schedule);
            System.out.println("📊 Freed up schedule slot");
        }

        appointmentRepository.delete(appointment);
        System.out.println("✅ Appointment deleted successfully: " + id);
    }

    // ✅ ADDED: Method to get appointment statistics
    public String getAppointmentStats() {
        long totalAppointments = appointmentRepository.count();
        long scheduledAppointments = appointmentRepository.findByStatus("SCHEDULED").size();
        long cancelledAppointments = appointmentRepository.findByStatus("CANCELLED").size();
        
        return String.format("Total: %d, Scheduled: %d, Cancelled: %d", 
                           totalAppointments, scheduledAppointments, cancelledAppointments);
    }
}