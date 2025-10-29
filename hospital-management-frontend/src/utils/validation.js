import * as yup from 'yup';

export const loginValidationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerValidationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  roles: yup
    .array()
    .min(1, 'At least one role is required')
    .required('Role is required'),
});

export const doctorValidationSchema = yup.object({
  name: yup
    .string()
    .required('Doctor name is required'),
  specialization: yup
    .string()
    .required('Specialization is required'),
  contact: yup
    .string()
    .required('Contact information is required'),
});

export const patientValidationSchema = yup.object({
  name: yup
    .string()
    .required('Patient name is required'),
  age: yup
    .number()
    .min(0, 'Age must be positive')
    .max(150, 'Age must be reasonable')
    .required('Age is required'),
  gender: yup
    .string()
    .required('Gender is required'),
});

export const appointmentValidationSchema = yup.object({
  patientId: yup
    .number()
    .required('Patient is required'),
  doctorId: yup
    .number()
    .required('Doctor is required'),
  scheduleId: yup
    .number()
    .required('Time slot is required'),
  reason: yup
    .string()
    .required('Reason for appointment is required'),
});
export const userProfileValidationSchema = yup.object({
  firstName: yup
    .string()
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .max(50, 'Last name must be less than 50 characters'),
  email: yup
    .string()
    .email('Invalid email address'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future'),
  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
});

export const doctorProfileValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  specialization: yup.string().required('Specialization is required'),
  contact: yup.string().required('Contact information is required'),
  qualifications: yup.string(),
  experienceYears: yup.number().min(0, 'Experience cannot be negative'),
  licenseNumber: yup.string(),
  consultationFee: yup.number().min(0, 'Fee cannot be negative')
});

export const patientProfileValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  age: yup.number().min(0, 'Age must be positive').max(150, 'Age must be reasonable'),
  gender: yup.string().required('Gender is required'),
  bloodGroup: yup.string(),
  height: yup.number().min(0, 'Height must be positive'),
  weight: yup.number().min(0, 'Weight must be positive')
});
