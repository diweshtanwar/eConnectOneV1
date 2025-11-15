import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Switch, FormControlLabel } from '@mui/material';
import { Lock, LockOpen, Warning } from '@mui/icons-material';
import { accountLockoutApi, type AccountLockoutDto, type UnlockAccountDto } from '../api/api';
import { DataFilters, type FilterOption, type FilterValues } from './DataFilters';

export const AccountLockout: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountLockoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountLockoutDto | null>(null);
  const [resetPassword, setResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  const lockoutFilters: FilterOption[] = [
    { key: 'search', label: 'Search User', type: 'text' },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'Admin', label: 'Admin' },
      { value: 'HO user', label: 'HO User' },
      { value: 'CSP', label: 'CSP' }
    ]},
    { key: 'status', label: 'Lock Status', type: 'select', options: [
      { value: 'locked', label: 'Locked' },
      { value: 'failed_attempts', label: 'Has Failed Attempts' },
      { value: 'normal', label: 'Normal' }
    ]}
  ];

  const fetchAccounts = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const data = showLockedOnly 
        ? await accountLockoutApi.getLockedAccounts()
        : await accountLockoutApi.getAllAccountsStatus();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch account status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: FilterValues) => {
    fetchAccounts(searchFilters);
  };

  const getFilteredAccounts = () => {
    let filtered = accounts;
    
    if (filterValues.search) {
      filtered = filtered.filter(a => 
        a.username.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        a.fullName.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        a.email.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.role) {
      filtered = filtered.filter(a => a.roleName === filterValues.role);
    }
    if (filterValues.status) {
      switch (filterValues.status) {
        case 'locked':
          filtered = filtered.filter(a => a.isLocked);
          break;
        case 'failed_attempts':
          filtered = filtered.filter(a => a.failedLoginAttempts > 0 && !a.isLocked);
          break;
        case 'normal':
          filtered = filtered.filter(a => a.failedLoginAttempts === 0 && !a.isLocked);
          break;
      }
    }
    
    return filtered;
  };

  const handleOpenUnlockDialog = (account: AccountLockoutDto) => {
    setSelectedAccount(account);
    setResetPassword(false);
    setNewPassword('');
    setUnlockDialogOpen(true);
    setError(null);
  };

  const handleCloseUnlockDialog = () => {
    setUnlockDialogOpen(false);
    setSelectedAccount(null);
    setResetPassword(false);
    setNewPassword('');
    setError(null);
  };

  const handleUnlockAccount = async () => {
    if (!selectedAccount) return;

    if (resetPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      const unlockDto: UnlockAccountDto = {
        userId: selectedAccount.userId,
        resetPassword,
        newPassword: resetPassword ? newPassword : undefined
      };

      await accountLockoutApi.unlockAccount(unlockDto);
      setSuccess(`Account unlocked successfully for ${selectedAccount.username}`);
      handleCloseUnlockDialog();
      fetchAccounts();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to unlock account.');
    } finally {
      setUnlocking(false);
    }
  };

  const getStatusChip = (account: AccountLockoutDto) => {
    if (account.isLocked) {
      return <Chip label="LOCKED" color="error" size="small" icon={<Lock />} />;
    }
    if (account.failedLoginAttempts > 0) {
      return <Chip label={`${account.failedLoginAttempts} Failed`} color="warning" size="small" icon={<Warning />} />;
    }
    return <Chip label="Normal" color="success" size="small" />;
  };

  const formatLockTime = (lockedUntil: string | null) => {
    if (!lockedUntil) return '-';
    const lockTime = new Date(lockedUntil);
    const now = new Date();
    if (lockTime <= now) return 'Expired';
    
    const diff = lockTime.getTime() - now.getTime();
    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} min remaining`;
  };

  useEffect(() => {
    fetchAccounts();
  }, [showLockedOnly]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock color="primary" />
        Account Lockout Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor and manage user account lockouts due to failed login attempts
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showLockedOnly}
              onChange={(e) => setShowLockedOnly(e.target.checked)}
            />
          }
          label="Show locked accounts only"
        />
      </Box>

      <DataFilters
        filters={lockoutFilters}
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
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Failed Attempts</TableCell>
              <TableCell>Remaining</TableCell>
              <TableCell>Lock Expires</TableCell>
              <TableCell>Last Failed</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAccounts().map((account) => (
              <TableRow key={account.userId}>
                <TableCell>{account.username}</TableCell>
                <TableCell>{account.fullName || '-'}</TableCell>
                <TableCell>
                  <Chip label={account.roleName} size="small" />
                </TableCell>
                <TableCell>{getStatusChip(account)}</TableCell>
                <TableCell>{account.failedLoginAttempts}</TableCell>
                <TableCell>
                  {account.isLocked ? 0 : account.remainingAttempts}
                </TableCell>
                <TableCell>{formatLockTime(account.lockedUntil)}</TableCell>
                <TableCell>
                  {account.lastFailedLoginAt 
                    ? new Date(account.lastFailedLoginAt).toLocaleString()
                    : '-'
                  }
                </TableCell>
                <TableCell align="center">
                  {(account.isLocked || account.failedLoginAttempts > 0) && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LockOpen />}
                      onClick={() => handleOpenUnlockDialog(account)}
                    >
                      Unlock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Unlock Account Dialog */}
      <Dialog open={unlockDialogOpen} onClose={handleCloseUnlockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Unlock Account: {selectedAccount?.username}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This will reset the failed login attempts and unlock the account.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={resetPassword}
                onChange={(e) => setResetPassword(e.target.checked)}
              />
            }
            label="Also reset password"
            sx={{ mb: 2 }}
          />

          {resetPassword && (
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 6 characters"
            />
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              The user will be able to login immediately after unlocking.
              {resetPassword && ' Make sure to share the new password securely.'}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnlockDialog}>Cancel</Button>
          <Button 
            onClick={handleUnlockAccount} 
            variant="contained" 
            disabled={unlocking || (resetPassword && !newPassword)}
          >
            {unlocking ? 'Unlocking...' : 'Unlock Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};