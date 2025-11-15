import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';

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
  users,
  getMonthName,
  handleCreateCommission
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Create Commission</DialogTitle>
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            <Select
              value={formData.userId}
              label="User"
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>{user.fullName} ({user.username})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={formData.month}
              label="Month"
              onChange={(e) => setFormData({ ...formData, month: e.target.value as number })}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{getMonthName(i + 1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Base Commission"
            type="number"
            value={formData.baseCommission}
            onChange={(e) => setFormData({ ...formData, baseCommission: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Bonus Commission"
            type="number"
            value={formData.bonusCommission}
            onChange={(e) => setFormData({ ...formData, bonusCommission: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Deductions"
            type="number"
            value={formData.deductions}
            onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Tax Deducted"
            type="number"
            value={formData.taxDeducted}
            onChange={(e) => setFormData({ ...formData, taxDeducted: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={handleCreateCommission} variant="contained">
        Create Commission
      </Button>
    </DialogActions>
  </Dialog>
);

export default CommissionCreatePage;
