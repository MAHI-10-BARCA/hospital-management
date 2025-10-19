import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleService } from '../../services/scheduleService';
import DoctorProfileSetup from '../Profile/DoctorProfileSetup';
import './AddSchedule.css';

const AddSchedule = () => {
  const { user } = useAuth();
  const [hasDoctorProfile, setHasDoctorProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    availableDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    maxPatients: 1
  });

  const handleProfileCreated = (profile) => {
    setHasDoctorProfile(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await scheduleService.createDoctorSchedule(user.id, formData);
      alert('Schedule added successfully!');
      setFormData({
        availableDate: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        maxPatients: 1
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Error adding schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // If user doesn't have doctor profile, show setup form
  if (user && user.hasRole('DOCTOR') && !hasDoctorProfile) {
    return (
      <div className="add-schedule-container">
        <DoctorProfileSetup onProfileCreated={handleProfileCreated} />
      </div>
    );
  }

  return (
    <div className="add-schedule-container">
      <h2>Add Schedule</h2>
      <form onSubmit={handleSubmit} className="schedule-form">
        {/* Your existing form fields here */}
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="availableDate"
            value={formData.availableDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>End Time:</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Slot Duration (minutes):</label>
          <input
            type="number"
            name="slotDuration"
            value={formData.slotDuration}
            onChange={handleChange}
            min="15"
            max="60"
            step="15"
          />
        </div>
        
        <div className="form-group">
          <label>Max Patients per Slot:</label>
          <input
            type="number"
            name="maxPatients"
            value={formData.maxPatients}
            onChange={handleChange}
            min="1"
            max="10"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Schedule...' : 'Add Schedule'}
        </button>
      </form>
    </div>
  );
};

export default AddSchedule;