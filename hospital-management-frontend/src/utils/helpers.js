import dayjs from 'dayjs';

// ✅ IMPROVED: Date formatting with null checks
export const formatDate = (date) => {
  if (!date) return 'Not scheduled';
  try {
    return dayjs(date).format('DD/MM/YYYY');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (time) => {
  if (!time) return 'Not scheduled';
  try {
    return dayjs(time, 'HH:mm:ss').format('hh:mm A');
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

export const formatDateTime = (date, time) => {
  return `${formatDate(date)} ${formatTime(time)}`;
};

// ✅ IMPROVED: Complete status management
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const getStatusColor = (status) => {
  const statusColors = {
    [APPOINTMENT_STATUS.SCHEDULED]: 'primary',
    [APPOINTMENT_STATUS.CONFIRMED]: 'info',
    [APPOINTMENT_STATUS.IN_PROGRESS]: 'warning',
    [APPOINTMENT_STATUS.COMPLETED]: 'success',
    [APPOINTMENT_STATUS.CANCELLED]: 'error'
  };
  return statusColors[status] || 'default';
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
    [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
    [APPOINTMENT_STATUS.IN_PROGRESS]: 'In Progress',
    [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
    [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled'
  };
  return statusLabels[status] || status;
};

export const getStatusIcon = (status) => {
  const statusIcons = {
    [APPOINTMENT_STATUS.SCHEDULED]: '📅',
    [APPOINTMENT_STATUS.CONFIRMED]: '✅',
    [APPOINTMENT_STATUS.IN_PROGRESS]: '🔄',
    [APPOINTMENT_STATUS.COMPLETED]: '✔️',
    [APPOINTMENT_STATUS.CANCELLED]: '❌'
  };
  return statusIcons[status] || '📋';
};

// User roles constants
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  PATIENT: 'ROLE_PATIENT',
  USER: 'ROLE_USER'
};

// Check if user has a specific role
export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

// Get user's main role for dashboard routing
export const getUserMainRole = (user) => {
  if (!user || !user.roles) return USER_ROLES.USER;
  
  const rolePriority = [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER];
  
  for (const role of rolePriority) {
    if (user.roles.includes(role)) {
      return role;
    }
  }
  
  return USER_ROLES.USER;
};

export const getUserInitials = (name) => {
  return name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'U';
};

// Check if user has permission for specific actions
export const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;
  
  const permissions = {
    // View permissions
    'view_dashboard': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    'view_doctors': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    'view_patients': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'view_appointments': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    
    // Management permissions
    'manage_doctors': [USER_ROLES.ADMIN],
    'manage_patients': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'manage_appointments': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'book_appointments': [USER_ROLES.ADMIN, USER_ROLES.PATIENT, USER_ROLES.USER],
    'manage_schedules': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    // Admin only
    'manage_users': [USER_ROLES.ADMIN],
    'view_reports': [USER_ROLES.ADMIN],
  };

  const allowedRoles = permissions[permission] || [];
  return user.roles.some(role => allowedRoles.includes(role));
};

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

export const canBookAppointments = (user) => {
  if (!user || !user.roles) return false;
  return user.roles.includes('ROLE_PATIENT') || user.roles.includes('ROLE_DOCTOR');
};

export const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Surgery',
  'Dentistry',
  'Ophthalmology',
  'Radiology'
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = [
  { value: 'ROUTINE', label: 'Routine Check-up' },
  { value: 'FOLLOWUP', label: 'Follow-up Visit' },
  { value: 'URGENT', label: 'Urgent Care' },
  { value: 'EMERGENCY', label: 'Emergency' }
];

// ✅ ADDED: Data mapping helper for appointments
export const mapAppointmentData = (appointment) => {
  // Handle both entity and DTO formats
  return {
    id: appointment.id,
    patientId: appointment.patient?.id || appointment.patientId,
    patientName: appointment.patient?.name || appointment.patientName,
    doctorId: appointment.doctor?.id || appointment.doctorId,
    doctorName: appointment.doctor?.name || appointment.doctorName,
    doctorSpecialization: appointment.doctor?.specialization || appointment.doctorSpecialization,
    scheduleId: appointment.schedule?.id || appointment.scheduleId,
    appointmentDate: appointment.schedule?.availableDate || appointment.appointmentDate,
    startTime: appointment.schedule?.startTime || appointment.startTime,
    endTime: appointment.schedule?.endTime || appointment.endTime,
    status: appointment.status,
    reason: appointment.reason,
    createdDate: appointment.createdDate
  };
};