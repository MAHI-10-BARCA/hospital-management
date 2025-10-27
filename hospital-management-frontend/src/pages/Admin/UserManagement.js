import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { People, Security, Settings } from '@mui/icons-material';

const UserManagement = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        User Management
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        This page is only accessible to administrators. Here you can manage all users in the system.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                0
              </Typography>
              <Button variant="outlined" size="small">
                View All Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Role Management
              </Typography>
              <Typography variant="h4" color="secondary" gutterBottom>
                0
              </Typography>
              <Button variant="outlined" size="small">
                Manage Roles
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Settings sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Typography variant="h4" color="success.main" gutterBottom>
                0
              </Typography>
              <Button variant="outlined" size="small">
                Configure
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Management Panel
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          This is the administrative user management panel. Here you can:
        </Typography>
        <ul>
          <li>View and manage all user accounts</li>
          <li>Assign and modify user roles</li>
          <li>Monitor user activity and access logs</li>
          <li>Reset passwords and manage account status</li>
          <li>Configure system-wide permissions</li>
        </ul>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Note:</strong> User management functionality will be implemented in the next phase.
          Currently, this serves as a demonstration of role-based access control.
        </Alert>
      </Paper>
    </Box>
  );
};

export default UserManagement;