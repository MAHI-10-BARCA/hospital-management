import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import './PatientProfileSetup.css';

const PatientProfileSetup = ({ onProfileCreated }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    currentMedications: ''
  });

  useEffect(() => {
    checkPatientProfile();
  }, [user, profile]);

  const checkPatientProfile = async () => {
    try {
      setLoading(true);
      if (profile && profile.age) {
        setHasProfile(true);
        if (onProfileCreated) {
          onProfileCreated(profile);
        }
      } else {
        setHasProfile(false);
        setShowForm(true);
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
    try {
      setLoading(true);
      await profileService.updatePatientProfile(formData);
      await refreshProfile();
      setHasProfile(true);
      setShowForm(false);
      if (onProfileCreated) {
        onProfileCreated(formData);
      }
      alert('Patient profile created successfully!');
    } catch (error) {
      console.error('Error creating patient profile:', error);
      alert('Error creating patient profile: ' + (error.response?.data || error.message));
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
    return <div className="loading">Checking patient profile...</div>;
  }

  if (hasProfile) {
    return (
      <div className="patient-profile-setup">
        <div className="success-message">
          ✅ Your patient profile is set up and ready!
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-setup">
      <div className="setup-header">
        <h2>Patient Profile Setup Required</h2>
        <p>Please complete your patient profile to access all features.</p>
      </div>

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
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any allergies..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentMedications">Current Medications</label>
            <textarea
              id="currentMedications"
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleChange}
              placeholder="List current medications..."
              rows="2"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Profile...' : 'Create Patient Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientProfileSetup;