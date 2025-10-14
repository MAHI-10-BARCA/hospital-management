// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

// USERS / PROFILE
export const getProfile = () => api.get("/api/profile/me");
export const updateProfile = (payload) => api.put("/api/profile/me", payload);

// DOCTORS
export const getDoctors = () => api.get("/doctors");
export const createDoctor = (payload) => api.post("/doctors", payload);
export const updateDoctor = (id, payload) => api.put(`/doctors/${id}`, payload);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// PATIENTS
export const getPatients = () => api.get("/patients");
export const createPatient = (payload) => api.post("/patients", payload);
export const updatePatient = (id, payload) => api.put(`/patients/${id}`, payload);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// APPOINTMENTS
export const getAppointments = () => api.get("/api/appointments");
export const createAppointment = (payload) => api.post("/api/appointments", payload);
export const deleteAppointment = (id) => api.delete(`/api/appointments/${id}`);

// SCHEDULES (if your backend supports them)
export const getAvailableSchedulesForDoctor = (doctorId) =>
  api.get(`/api/schedules/doctor/${doctorId}/available`);

export default api;
