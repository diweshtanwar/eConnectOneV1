import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Lock, Search, Visibility } from '@mui/icons-material';
import { userApi, type UserResponseDto, type PasswordResetDto } from '../api/api';
import { DataFilters, type FilterOption, type FilterValues } from './DataFilters';

export const PasswordReset: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const resetFilters: FilterOption[] = [
    { key: 'search', label: 'Search User', type: 'text' },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'Admin', label: 'Admin' },
      { value: 'HO user', label: 'HO User' },
      { value: 'CSP', label: 'CSP' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const fetchUsers = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers(1, 100);
      // Filter out Master Admin users for security
      const filteredUsers = data.filter(user => user.roleName !== 'Master Admin');
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: FilterValues) => {
    fetchUsers(searchFilters);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (filterValues.search) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.role) {
      filtered = filtered.filter(u => u.roleName === filterValues.role);
    }
    if (filterValues.status) {
      filtered = filtered.filter(u => 
        filterValues.status === 'active' ? u.isActive : !u.isActive
      );
    }
    
    return filtered;
  };

  const handleOpenResetDialog = (user: UserResponseDto) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handlePasswordReset = async () => {
    if (!selectedUser) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetting(true);
    setError(null);

    try {
      const passwordResetDto: PasswordResetDto = { newPassword };
      await userApi.resetUserPassword(selectedUser.id, passwordResetDto);
      setSuccess(`Password reset successfully for ${selectedUser.username}`);
      handleCloseResetDialog();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock color="primary" />
        Password Reset Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reset passwords for users who have forgotten their credentials
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <DataFilters
        filters={resetFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        onSearch={handleSearch}
        searchMode={true}
      />

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredUsers().map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Chip label={user.roleName} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'} 
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenResetDialog(user)}
                    title="Reset Password"
                  >
                    <Lock />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reset Password for {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter a new password for this user. The password will be securely hashed and stored.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Minimum 6 characters"
          />
          
          <TextField
            margin="dense"
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button 
            variant="outlined" 
            onClick={generateRandomPassword}
            size="small"
            sx={{ mb: 2 }}
          >
            Generate Random Password
          </Button>

          {newPassword && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Make sure to share the new password with the user securely. 
                They should change it after their first login.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Cancel</Button>
          <Button 
            onClick={handlePasswordReset} 
            variant="contained" 
            disabled={resetting || !newPassword || !confirmPassword}
          >
            {resetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};