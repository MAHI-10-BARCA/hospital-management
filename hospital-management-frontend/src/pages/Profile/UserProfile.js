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
import { useSnackbar } from 'notistack'; // ADD THIS IMPORT
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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      {profile && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {getUserInitials(profile.username)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      {profile.username}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      User ID: {profile.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Account Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Username:</strong> {profile.username}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>User ID:</strong> {profile.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Roles & Permissions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pl: 2 }}>
                    {profile.roles?.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.replace('ROLE_', '')}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{ borderRadius: 2 }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Stats
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Member since: Recently
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Last login: Today
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
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
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Edit Profile
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;