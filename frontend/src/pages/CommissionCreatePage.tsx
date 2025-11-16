import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, FormControl, InputLabel, Select, MenuItem, TextField,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Box, CircularProgress, Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { userApi, api } from '../api/api';

interface CommissionCreatePageProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  users: any[];
  getMonthName: (month: number) => string;
  handleCreateCommission: () => void;
}

const CommissionCreatePage: React.FC<CommissionCreatePageProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  users: propUsers,
  getMonthName,
  handleCreateCommission
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [commissionForm, setCommissionForm] = useState<any>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseCommission: 0,
    bonusCommission: 0,
    deductions: 0,
    taxDeducted: 0,
    description: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers(1, 100);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user: any) => {
    setSelectedUser(user);
    setCommissionForm({
      cspUserId: user.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      baseCommission: 0,
      bonusCommission: 0,
      deductions: 0,
      taxDeducted: 0,
      description: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const [dialogError, setDialogError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setDialogError('');
      setSubmitting(true);
      console.log('Creating commission with data:', commissionForm);
      
      await api.post('/commission', commissionForm);
      
      handleCloseDialog();
      onClose();
    } catch (error: any) {
      console.error('Commission creation error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to create commission. ';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage += '\n\nValidation Errors:\n' + validationErrors;
        }
        
        if (data.title) errorMessage += '\n' + data.title;
        if (data.message) errorMessage += '\n' + data.message;
        if (data.detail) errorMessage += '\n' + data.detail;
        
        errorMessage += '\n\nDebug Info: ' + JSON.stringify(data, null, 2);
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setDialogError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.roleName}</TableCell>
                <TableCell>
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(user)}>
                    <Add fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Commission</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }} onClose={() => setDialogError('')}>
              {dialogError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Username"
                value={selectedUser?.username || ''}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={selectedUser?.fullName || ''}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={commissionForm.month}
                  label="Month"
                  onChange={(e) => setCommissionForm({ ...commissionForm, month: e.target.value as number })}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{getMonthName(i + 1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={commissionForm.year}
                onChange={(e) => setCommissionForm({ ...commissionForm, year: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Commission"
                type="number"
                value={commissionForm.baseCommission}
                onChange={(e) => setCommissionForm({ ...commissionForm, baseCommission: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bonus Commission"
                type="number"
                value={commissionForm.bonusCommission}
                onChange={(e) => setCommissionForm({ ...commissionForm, bonusCommission: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deductions"
                type="number"
                value={commissionForm.deductions}
                onChange={(e) => setCommissionForm({ ...commissionForm, deductions: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tax Deducted"
                type="number"
                value={commissionForm.taxDeducted}
                onChange={(e) => setCommissionForm({ ...commissionForm, taxDeducted: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={commissionForm.description}
                onChange={(e) => setCommissionForm({ ...commissionForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Commission'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionCreatePage;
