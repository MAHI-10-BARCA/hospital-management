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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasRole, USER_ROLES } from '../../utils/helpers';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
  },
  {
    text: 'Doctors',
    icon: <LocalHospital />,
    path: '/doctors',
    roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
  },
  {
    text: 'Patients',
    icon: <People />,
    path: '/patients',
    roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
  },
  {
    text: 'Appointments',
    icon: <CalendarToday />,
    path: '/appointments',
    roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER],
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.some(role => hasRole(user, role))
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
          Hospital Management
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