// src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Collapse,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  People,
  LocalHospital,
  CalendarToday,
  ExpandLess,
  ExpandMore,
  Group,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/helpers';

const drawerWidth = 260;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    permission: 'view_dashboard',
  },
  {
    text: 'Appointments',
    icon: <CalendarToday />,
    path: '/appointments',
    permission: 'view_appointments',
  },
];

const adminMenuItems = [
  {
    text: 'User Management',
    icon: <Group />,
    path: '/admin/users',
    permission: 'manage_users',
    children: [
      {
        text: 'Manage Doctors',
        icon: <LocalHospital />,
        path: '/doctors',
        permission: 'view_doctors',
      },
      {
        text: 'Manage Patients',
        icon: <People />,
        path: '/patients',
        permission: 'manage_patients',
      },
    ]
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openAdminMenu, setOpenAdminMenu] = useState(false);

  const filteredMenuItems = menuItems.filter(item =>
    hasPermission(user, item.permission)
  );

  const filteredAdminItems = adminMenuItems.filter(item =>
    hasPermission(user, item.permission)
  );

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleAdminMenuClick = () => {
    setOpenAdminMenu(!openAdminMenu);
  };

  const isItemSelected = (path) => {
    return location.pathname === path;
  };

  const isChildSelected = (children) => {
    return children.some(child => location.pathname === child.path);
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.3)',
      pt: 8, // Added top padding to account for navbar height
    }}>
      {/* Menu Items Only - No Header Panel */}
      <List sx={{ p: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={isItemSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: isItemSelected(item.path) 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                  : 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                  },
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.8)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px 0 rgba(31, 38, 135, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isItemSelected(item.path) ? '#6366f1' : '#64748b',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isItemSelected(item.path) ? 600 : 500,
                  color: isItemSelected(item.path) ? '#1e293b' : '#475569',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Admin Menu Items with Dropdown */}
        {filteredAdminItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleAdminMenuClick}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: openAdminMenu || isChildSelected(item.children || [])
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.8)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px 0 rgba(31, 38, 135, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: openAdminMenu || isChildSelected(item.children || []) ? '#6366f1' : '#64748b',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: openAdminMenu || isChildSelected(item.children || []) ? '#1e293b' : '#475569',
                  }}
                />
                {openAdminMenu ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={openAdminMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {item.children?.map((child) => (
                  <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isItemSelected(child.path)}
                      onClick={() => handleNavigation(child.path)}
                      sx={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: isItemSelected(child.path)
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.4)',
                        pl: 4,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                        },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.6)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isItemSelected(child.path) ? '#6366f1' : '#64748b',
                          minWidth: 32,
                        }}
                      >
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={child.text}
                        primaryTypographyProps={{
                          fontSize: '0.85rem',
                          fontWeight: isItemSelected(child.path) ? 600 : 500,
                          color: isItemSelected(child.path) ? '#1e293b' : '#475569',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
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
            background: 'transparent',
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
            border: 'none',
            background: 'transparent',
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