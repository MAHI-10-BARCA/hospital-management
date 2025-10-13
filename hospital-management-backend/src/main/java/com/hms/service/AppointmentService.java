package com.hms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.entity.Appointment;
import com.hms.entity.DoctorSchedule;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorScheduleRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Transactional // Ensures the whole method succeeds or fails together
    public Appointment createAppointment(Appointment appointment) {
        // 1. Find the schedule slot the user wants to book
        DoctorSchedule schedule = scheduleRepository.findById(appointment.getSchedule().getId())
                .orElseThrow(() -> new RuntimeException("Schedule slot not found"));

        // 2. Check if the slot is already booked
        if (schedule.isBooked()) {
            throw new RuntimeException("This schedule slot is already booked.");
        }

        // 3. Mark the slot as booked
        schedule.setBooked(true);
        scheduleRepository.save(schedule);

        // 4. Set default status and save the appointment
        appointment.setStatus("SCHEDULED");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    // Get appointments for a specific patient
    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // Get appointments for a specific doctor
    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}