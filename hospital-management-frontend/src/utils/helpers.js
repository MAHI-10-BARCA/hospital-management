// utils/helpers.js
import dayjs from 'dayjs';

export const formatDate = (date) => {
  if (!date) return 'Not scheduled';
  try {
    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error, date);
    return 'Invalid Date';
  }
};

export const formatTime = (time) => {
  if (!time) return 'Not scheduled';
  try {
    let timeStr = time;
    
    if (typeof time === 'object') {
      timeStr = time.toString();
    }
    
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (isNaN(date.getTime())) return timeStr;
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    console.error('Time formatting error:', error, time);
    return time;
  }
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'Unknown';
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('DateTime formatting error:', error, dateTime);
    return 'Invalid Date';
  }
};

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

export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  PATIENT: 'ROLE_PATIENT',
  USER: 'ROLE_USER'
};

export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

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

export const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;
  
  const permissions = {
    'view_dashboard': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    'view_doctors': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    'view_patients': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'view_appointments': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
    'manage_doctors': [USER_ROLES.ADMIN],
    'manage_patients': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'manage_appointments': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
    'book_appointments': [USER_ROLES.ADMIN, USER_ROLES.PATIENT, USER_ROLES.USER],
    'manage_schedules': [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
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

export const mapAppointmentData = (appointment) => {
  const mapped = {
    id: appointment.id,
    patientId: appointment.patient?.id || appointment.patientId,
    patientName: appointment.patient?.name || appointment.patientName || 'Unknown Patient',
    doctorId: appointment.doctor?.id || appointment.doctorId,
    doctorName: appointment.doctor?.name || appointment.doctorName || 'Unknown Doctor',
    doctorSpecialization: appointment.doctor?.specialization || appointment.doctorSpecialization || 'General',
    scheduleId: appointment.schedule?.id || appointment.scheduleId,
    appointmentDate: appointment.schedule?.availableDate || 
                    appointment.appointmentDate || 
                    appointment.appointmentDate,
    startTime: appointment.schedule?.startTime || 
               appointment.startTime || 
               appointment.appointmentTime,
    endTime: appointment.schedule?.endTime || appointment.endTime,
    status: appointment.status || 'SCHEDULED',
    reason: appointment.reason || 'Regular checkup',
    createdDate: appointment.createdDate
  };

  console.log('📅 Mapped appointment:', mapped);
  return mapped;
};