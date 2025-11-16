import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Alert, ToggleButtonGroup, ToggleButton, Card, CardContent, Grid, IconButton } from '@mui/material';
import { CheckCircle, Cancel, ViewModule, ViewList, Person, LockReset } from '@mui/icons-material';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';

interface PasswordResetRequest {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  approvedBy?: string;
  approvedDate?: string;
}

export const PasswordResetManagement: React.FC = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  const resetFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'PENDING', label: 'Pending' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' }
    ]},
    { key: 'dateRange', label: 'Request Date', type: 'dateRange' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: PasswordResetRequest[] = [
        { id: 1, userId: 101, username: 'user1', fullName: 'John Doe', email: 'john@example.com', requestDate: new Date().toISOString(), status: 'PENDING', requestedBy: 'Self' },
        { id: 2, userId: 102, username: 'user2', fullName: 'Jane Smith', email: 'jane@example.com', requestDate: new Date(Date.now() - 86400000).toISOString(), status: 'APPROVED', requestedBy: 'Admin', approvedBy: 'Master Admin', approvedDate: new Date().toISOString() }
      ];
      setRequests(mockData);
    } catch (err) {
      setError('Failed to fetch password reset requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      // API call to approve reset
      setSuccess('Password reset approved successfully!');
      fetchRequests();
    } catch (err) {
      setError('Failed to approve password reset.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      // API call to reject reset
      setSuccess('Password reset rejected.');
      fetchRequests();
    } catch (err) {
      setError('Failed to reject password reset.');
    }
  };

  const getFilteredRequests = () => {
    let filtered = requests;
    if (filterValues.search) {
      filtered = filtered.filter(r => 
        r.username.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        r.fullName.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        r.email.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.status) {
      filtered = filtered.filter(r => r.status === filterValues.status);
    }
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Password Reset Management</Typography>
      
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
        filters={resetFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        searchMode={true}
      />

      {viewMode === 'tile' ? (
        <Grid container spacing={2}>
          {getFilteredRequests().map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {request.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {request.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Requested: {new Date(request.requestDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    By: {request.requestedBy}
                  </Typography>
                  <Chip label={request.status} color={getStatusColor(request.status)} size="small" sx={{ mb: 2 }} />
                  {request.status === 'PENDING' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleApprove(request.id)} fullWidth>
                        Approve
                      </Button>
                      <Button size="small" variant="contained" color="error" startIcon={<Cancel />} onClick={() => handleReject(request.id)} fullWidth>
                        Reject
                      </Button>
                    </Box>
                  )}
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
                <TableCell>Request Date</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approved By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredRequests().map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{request.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{request.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                  </TableCell>
                  <TableCell>{request.approvedBy || '-'}</TableCell>
                  <TableCell>
                    {request.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="success" onClick={() => handleApprove(request.id)}>
                          <CheckCircle fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleReject(request.id)}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Box>
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
