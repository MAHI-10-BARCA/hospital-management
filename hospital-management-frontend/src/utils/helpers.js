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

export const hasRole = (user, role) => {
  return user?.roles?.includes(role);
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

// ADD THESE MISSING CONSTANTS:
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  PATIENT: 'ROLE_PATIENT',
  USER: 'ROLE_USER'
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