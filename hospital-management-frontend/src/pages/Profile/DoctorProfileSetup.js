import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import './DoctorProfileSetup.css';

const DoctorProfileSetup = ({ onProfileCreated }) => {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contact: ''
  });

  useEffect(() => {
    checkDoctorProfile();
  }, [user]);

  const checkDoctorProfile = async () => {
    try {
      setLoading(true);
      const profile = await doctorService.getMyDoctorProfile();
      setHasProfile(true);
      if (onProfileCreated) {
        onProfileCreated(profile);
      }
    } catch (error) {
      console.log('Doctor profile not found:', error.message);
      setHasProfile(false);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const profile = await doctorService.createDoctorProfile(formData);
      setHasProfile(true);
      setShowForm(false);
      if (onProfileCreated) {
        onProfileCreated(profile);
      }
      alert('Doctor profile created successfully! You can now add schedules.');
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      alert('Error creating doctor profile: ' + (error.response?.data || error.message));
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

  if (loading) {
    return <div className="loading">Checking doctor profile...</div>;
  }

  if (hasProfile) {
    return null; // Don't show anything if profile exists
  }

  return (
    <div className="doctor-profile-setup">
      <div className="setup-header">
        <h2>Doctor Profile Setup Required</h2>
        <p>Before you can add schedules, you need to set up your doctor profile.</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="doctor-profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              placeholder="e.g., Cardiology, Neurology, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Information *</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="Phone number or email"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Profile...' : 'Create Doctor Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default DoctorProfileSetup;