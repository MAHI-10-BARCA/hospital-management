import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getUserInitials } from '../../utils/helpers';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await authService.getProfile();
      setProfile(profileData);
    } catch (err) {
      setError('Failed to load profile');
      enqueueSnackbar('Failed to load profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({ username: profile?.username || '' });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!editForm.username.trim()) {
      setError('Username is required');
      setSubmitting(false);
      return;
    }

    try {
      const updatedUser = await authService.updateProfile(editForm);
      setProfile(updatedUser);
      updateUser(updatedUser);
      setEditDialogOpen(false);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        sx={{ color: 'text.primary', mb: 4 }}
      >
        My Profile
      </Typography>

      {profile && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontFamily: '"Inter", sans-serif'
                      }}
                    >
                      {getUserInitials(profile.username)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {profile.username}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ color: 'text.secondary' }}
                    >
                      User ID: {profile.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ color: 'text.primary' }}
                  >
                    Account Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography 
                      variant="body1" 
                      gutterBottom
                      sx={{ color: 'text.primary' }}
                    >
                      <strong>Username:</strong> {profile.username}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom
                      sx={{ color: 'text.primary' }}
                    >
                      <strong>User ID:</strong> {profile.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ color: 'text.primary' }}
                  >
                    Roles & Permissions
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    pl: 2 
                  }}>
                    {profile.roles?.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.replace('ROLE_', '')}
                        color="primary"
                        variant="outlined"
                        sx={{
                          border: '2px solid',
                          borderRadius: '8px',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  fontWeight="bold"
                  sx={{ color: 'text.primary' }}
                >
                  Quick Stats
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ color: 'text.secondary' }}
                  >
                    Member since: Recently
                  </Typography>
                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ color: 'text.secondary' }}
                  >
                    Last login: Today
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    Account status: Active
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        <DialogTitle>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ color: 'text.primary' }}
          >
            Edit Profile
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: '12px'
              }}
            >
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Username"
            value={editForm.username}
            onChange={(e) => setEditForm({ username: e.target.value })}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;