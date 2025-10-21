import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInitials } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const getRoleColor = () => {
    if (user?.roles?.includes('ROLE_ADMIN')) return '#6366f1';
    if (user?.roles?.includes('ROLE_DOCTOR')) return '#10b981';
    if (user?.roles?.includes('ROLE_PATIENT')) return '#f59e0b';
    return '#64748b';
  };

  const getRoleLabel = () => {
    if (user?.roles?.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user?.roles?.includes('ROLE_DOCTOR')) return 'DOCTOR';
    if (user?.roles?.includes('ROLE_PATIENT')) return 'PATIENT';
    return 'USER';
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.1)',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.15)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Typography
          variant="h5"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          🏥 HMS
        </Typography>

        {/* User Info and Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mr: 2,
        }}>
          {/* Role Chip */}
          <Chip
            label={getRoleLabel()}
            size="small"
            sx={{
              backgroundColor: alpha(getRoleColor(), 0.1),
              color: getRoleColor(),
              fontWeight: 600,
              fontSize: '0.75rem',
              border: `1px solid ${alpha(getRoleColor(), 0.3)}`,
              backdropFilter: 'blur(10px)',
              display: { xs: 'none', sm: 'flex' },
            }}
          />

          {/* Welcome Text */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}>
            <Typography 
              variant="body2" 
              fontWeight="600"
              sx={{ color: '#1e293b' }}
            >
              {user?.username}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Welcome back! 👋
            </Typography>
          </Box>

          {/* User Avatar */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                width: 40,
                height: 40,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px 0 rgba(99, 102, 241, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getUserInitials(user?.username)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
              overflow: 'visible',
              '& .MuiMenuItem-root': {
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              },
            },
          }}
        >
          {/* User Info in Menu */}
          <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="600" color="#1e293b">
              {user?.username}
            </Typography>
            <Typography variant="caption" color="#64748b" fontWeight="500">
              {getRoleLabel()} • {user?.email}
            </Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }} />
          
          <MenuItem onClick={handleProfile}>
            <Person sx={{ mr: 2, color: '#6366f1' }} />
            <Typography variant="body2" fontWeight="500">
              Profile Settings
            </Typography>
          </MenuItem>
          
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2, color: '#ef4444' }} />
            <Typography variant="body2" fontWeight="500" color="#ef4444">
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;