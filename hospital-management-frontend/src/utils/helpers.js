import dayjs from 'dayjs';

export const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatTime = (time) => {
  return dayjs(time, 'HH:mm:ss').format('hh:mm A');
};

export const formatDateTime = (date, time) => {
  return `${formatDate(date)} ${formatTime(time)}`;
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

export const getStatusColor = (status) => {
  switch (status) {
    case 'SCHEDULED': return 'primary';
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
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

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
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
// Add these to your existing helpers.js file

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = [
  { value: 'ROUTINE', label: 'Routine Check-up' },
  { value: 'FOLLOWUP', label: 'Follow-up Visit' },
  { value: 'URGENT', label: 'Urgent Care' },
  { value: 'EMERGENCY', label: 'Emergency' }
];