import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import './PatientProfileSetup.css';

const PatientProfileSetup = ({ onProfileCreated }) => {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    checkPatientProfile();
  }, [user]);

  const checkPatientProfile = async () => {
    try {
      setLoading(true);
      const profile = await patientService.getMyPatientProfile();
      setHasProfile(true);
      if (onProfileCreated) {
        onProfileCreated(profile);
      }
    } catch (error) {
      console.log('Patient profile not found:', error.message);
      setHasProfile(false);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError('Please enter a valid age (1-120)');
      return;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }

    try {
      setLoading(true);
      const profile = await patientService.createPatientProfile(formData);
      setHasProfile(true);
      setShowForm(false);
      if (onProfileCreated) {
        onProfileCreated(profile);
      }
      // Show success message
      alert('Patient profile created successfully! You can now book appointments.');
    } catch (error) {
      console.error('Error creating patient profile:', error);
      setError('Error creating patient profile: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="patient-profile-setup">
        <div className="loading">Checking patient profile...</div>
      </div>
    );
  }

  if (hasProfile) {
    return (
      <div className="patient-profile-setup">
        <div className="success-message">
          ✅ Your patient profile is set up and ready! You can now book appointments.
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-setup">
      <div className="setup-header">
        <h2>Patient Profile Setup Required</h2>
        <p>Before you can book appointments, you need to set up your patient profile with some basic information.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="patient-profile-form">
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="Enter your age"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="submit-btn"
          >
            {loading ? 'Creating Profile...' : 'Create Patient Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientProfileSetup;