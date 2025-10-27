// Role-based permissions
export const userPermissions = {
  ROLE_ADMIN: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageDoctors: true,
    canManagePatients: true,
    canManageAppointments: true,
    canManageSchedules: true,
    canViewReports: true,
    canBookAppointments: true,
    canViewDoctors: true,
    canViewPatients: true,
    canViewAppointments: true,
    canViewSchedules: true,
  },
  ROLE_DOCTOR: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageDoctors: false,
    canManagePatients: true, // Doctors can update patient records
    canManageAppointments: true, // Doctors can update appointment status
    canManageSchedules: true, // Doctors can manage their own schedules
    canViewReports: true,
    canBookAppointments: false,
    canViewDoctors: true,
    canViewPatients: true,
    canViewAppointments: true,
    canViewSchedules: true,
  },
  ROLE_PATIENT: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageDoctors: false,
    canManagePatients: false,
    canManageAppointments: false,
    canManageSchedules: false,
    canViewReports: false,
    canBookAppointments: true, // Patients can book appointments
    canViewDoctors: true,
    canViewPatients: false, // Patients can only view their own data
    canViewAppointments: true, // Only their appointments
    canViewSchedules: true, // To see doctor availability
  },
  ROLE_USER: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageDoctors: false,
    canManagePatients: false,
    canManageAppointments: false,
    canManageSchedules: false,
    canViewReports: false,
    canBookAppointments: true, // Regular users can book appointments
    canViewDoctors: true,
    canViewPatients: false,
    canViewAppointments: true, // Only their appointments
    canViewSchedules: true,
  }
};

// Helper function to check permissions
export const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;
  
  for (const role of user.roles) {
    if (userPermissions[role] && userPermissions[role][permission]) {
      return true;
    }
  }
  return false;
};

// Get user's main role for dashboard routing
export const getUserMainRole = (user) => {
  if (!user || !user.roles) return 'ROLE_USER';
  
  const rolePriority = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT', 'ROLE_USER'];
  
  for (const role of rolePriority) {
    if (user.roles.includes(role)) {
      return role;
    }
  }
  
  return 'ROLE_USER';
};