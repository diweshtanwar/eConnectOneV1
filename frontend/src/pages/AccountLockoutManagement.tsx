import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Alert, ToggleButtonGroup, ToggleButton, Card, CardContent, Grid, IconButton } from '@mui/material';
import { LockOpen, Lock, ViewModule, ViewList, Person } from '@mui/icons-material';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';

interface LockedAccount {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  lockDate: string;
  lockReason: string;
  failedAttempts: number;
  status: 'LOCKED' | 'UNLOCKED';
  lockedBy: string;
  unlockedBy?: string;
  unlockedDate?: string;
}

export const AccountLockoutManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<LockedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  const lockoutFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'LOCKED', label: 'Locked' },
      { value: 'UNLOCKED', label: 'Unlocked' }
    ]},
    { key: 'dateRange', label: 'Lock Date', type: 'dateRange' }
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: LockedAccount[] = [
        { id: 1, userId: 101, username: 'user1', fullName: 'John Doe', email: 'john@example.com', lockDate: new Date().toISOString(), lockReason: 'Multiple failed login attempts', failedAttempts: 5, status: 'LOCKED', lockedBy: 'System' },
        { id: 2, userId: 102, username: 'user2', fullName: 'Jane Smith', email: 'jane@example.com', lockDate: new Date(Date.now() - 86400000).toISOString(), lockReason: 'Security policy violation', failedAttempts: 3, status: 'UNLOCKED', lockedBy: 'Admin', unlockedBy: 'Master Admin', unlockedDate: new Date().toISOString() }
      ];
      setAccounts(mockData);
    } catch (err) {
      setError('Failed to fetch locked accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (id: number) => {
    try {
      // API call to unlock account
      setSuccess('Account unlocked successfully!');
      fetchAccounts();
    } catch (err) {
      setError('Failed to unlock account.');
    }
  };

  const handleLock = async (id: number) => {
    try {
      // API call to lock account
      setSuccess('Account locked successfully!');
      fetchAccounts();
    } catch (err) {
      setError('Failed to lock account.');
    }
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
    if (filterValues.status) {
      filtered = filtered.filter(a => a.status === filterValues.status);
    }
    return filtered;
  };

  const getStatusColor = (status: string) => {
    return status === 'LOCKED' ? 'error' : 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Account Lockout Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="tile">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <DataFilters
        filters={lockoutFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        searchMode={true}
      />

      {viewMode === 'tile' ? (
        <Grid container spacing={2}>
          {getFilteredAccounts().map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {account.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {account.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {account.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Locked: {new Date(account.lockDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Reason: {account.lockReason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Failed Attempts: {account.failedAttempts}
                  </Typography>
                  <Chip label={account.status} color={getStatusColor(account.status)} size="small" sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {account.status === 'LOCKED' ? (
                      <Button size="small" variant="contained" color="success" startIcon={<LockOpen />} onClick={() => handleUnlock(account.id)} fullWidth>
                        Unlock
                      </Button>
                    ) : (
                      <Button size="small" variant="contained" color="error" startIcon={<Lock />} onClick={() => handleLock(account.id)} fullWidth>
                        Lock
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Lock Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Failed Attempts</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Locked By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAccounts().map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{account.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{account.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{new Date(account.lockDate).toLocaleDateString()}</TableCell>
                  <TableCell>{account.lockReason}</TableCell>
                  <TableCell>{account.failedAttempts}</TableCell>
                  <TableCell>
                    <Chip label={account.status} color={getStatusColor(account.status)} size="small" />
                  </TableCell>
                  <TableCell>{account.lockedBy}</TableCell>
                  <TableCell>
                    {account.status === 'LOCKED' ? (
                      <IconButton size="small" color="success" onClick={() => handleUnlock(account.id)}>
                        <LockOpen fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" color="error" onClick={() => handleLock(account.id)}>
                        <Lock fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};
