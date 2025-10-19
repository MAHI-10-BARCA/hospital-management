import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  LocalHospital,
  CalendarToday,
  Person,
  AdminPanelSettings,
  Schedule as ScheduleIcon, // Add this import
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/helpers';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    permission: 'view_dashboard',
  },
  {
    text: 'Doctors',
    icon: <LocalHospital />,
    path: '/doctors',
    permission: 'view_doctors',
  },
  {
    text: 'Patients',
    icon: <People />,
    path: '/patients',
    permission: 'manage_patients', // Only admin and doctors
  },
  {
    text: 'Appointments',
    icon: <CalendarToday />,
    path: '/appointments',
    permission: 'view_appointments',
  },
  {
    text: 'Book Appointment',
    icon: <Person />,
    path: '/appointments/book',
    permission: 'book_appointments', // Patients and doctors only
  },
  {
    text: 'Manage Schedule',
    icon: <ScheduleIcon />,
    path: '/schedules/manage',
    permission: 'manage_schedules', // Doctors only
  },
  {
    text: 'User Management',
    icon: <AdminPanelSettings />,
    path: '/admin/users',
    permission: 'manage_users', // Admin only
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item =>
    hasPermission(user, item.permission)
  );

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const drawerContent = (
    <Box>
      {/* Sidebar Header */}
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          HMS
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary"
        >
          {user?.roles?.includes('ROLE_ADMIN') ? 'Admin Panel' : 
           user?.roles?.includes('ROLE_DOCTOR') ? 'Doctor Portal' :
           user?.roles?.includes('ROLE_PATIENT') ? 'Patient Portal' : 'User Portal'}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ p: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;