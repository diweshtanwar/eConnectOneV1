import React, { useState } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Edit, Delete, CheckCircle } from '@mui/icons-material';
import { commissionApi } from '../api/api';

interface CommissionListPageProps {
  commissions: any[];
  selectedYear: number | '';
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  selectedMonth: number | '';
  setSelectedMonth: (month: number) => void;
  getMonthName: (month: number) => string;
  user: any;
  getStatusColor: (status: string) => any;
  onRefresh: () => void;
}

const CommissionListPage: React.FC<CommissionListPageProps> = ({
  commissions,
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedMonth,
  setSelectedMonth,
  getMonthName,
  user,
  getStatusColor,
  onRefresh
}) => {
  const [editDialog, setEditDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [approveData, setApproveData] = useState({ status: 'APPROVED', remarks: '' });
  const [message, setMessage] = useState('');

  const handleEdit = (commission: any) => {
    setSelectedCommission(commission);
    setEditData({
      month: commission.month,
      year: commission.year,
      baseCommission: commission.baseCommission,
      bonusCommission: commission.bonusCommission,
      deductions: commission.deductions,
      taxDeducted: commission.taxDeducted,
      description: commission.description || ''
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      await commissionApi.updateCommission(selectedCommission.commissionId, editData);
      setMessage('Commission updated successfully');
      setEditDialog(false);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update commission');
    }
  };

  const handleDelete = async (commissionId: string) => {
    if (!confirm('Are you sure you want to delete this commission?')) return;
    try {
      await commissionApi.deleteCommission(commissionId);
      setMessage('Commission deleted successfully');
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to delete commission');
    }
  };

  const handleApprove = (commission: any) => {
    setSelectedCommission(commission);
    setApproveData({ status: 'APPROVED', remarks: '' });
    setApproveDialog(true);
  };

  const handleSaveApprove = async () => {
    try {
      await commissionApi.updateCommissionStatus(selectedCommission.commissionId, approveData.status, approveData.remarks);
      setMessage(`Commission ${approveData.status.toLowerCase()} successfully`);
      setApproveDialog(false);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            displayEmpty
          >
            {availableYears.length === 0 && (
              <MenuItem value="">No Years</MenuItem>
            )}
            {availableYears.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            displayEmpty
          >
            <MenuItem value=''>All</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{getMonthName(i + 1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>{message}</Alert>}
      {commissions.length === 0 ? (
        <Alert severity="info">
          No commissions found for {selectedYear}. {(user?.role === 'Master Admin' || user?.role === 'Admin') && 'Click "Create Commission" to add new commission records.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Base Commission</TableCell>
                <TableCell>Bonus</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Tax</TableCell>
                <TableCell>Net Payable</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.commissionId}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {commission.cspUser?.fullName || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {commission.cspUser?.username || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getMonthName(commission.month)} {commission.year}</TableCell>
                  <TableCell>{commission.baseCommission}</TableCell>
                  <TableCell>{commission.bonusCommission}</TableCell>
                  <TableCell>{commission.deductions}</TableCell>
                  <TableCell>{commission.taxDeducted}</TableCell>
                  <TableCell>{commission.netPayable}</TableCell>
                  <TableCell>
                    <Chip label={commission.status} color={getStatusColor(commission.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {user?.roleName === 'Master Admin' && (
                      <>
                        <IconButton size="small" onClick={() => handleEdit(commission)} color="primary"><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(commission.commissionId)} color="error"><Delete fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleApprove(commission)} color="success"><CheckCircle fontSize="small" /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Commission</DialogTitle>
        <DialogContent>
          <TextField label="Month" type="number" fullWidth margin="dense" value={editData.month} onChange={(e) => setEditData({...editData, month: Number(e.target.value)})} inputProps={{min: 1, max: 12}} />
          <TextField label="Year" type="number" fullWidth margin="dense" value={editData.year} onChange={(e) => setEditData({...editData, year: Number(e.target.value)})} />
          <TextField label="Base Commission" type="number" fullWidth margin="dense" value={editData.baseCommission} onChange={(e) => setEditData({...editData, baseCommission: Number(e.target.value)})} />
          <TextField label="Bonus Commission" type="number" fullWidth margin="dense" value={editData.bonusCommission} onChange={(e) => setEditData({...editData, bonusCommission: Number(e.target.value)})} />
          <TextField label="Deductions" type="number" fullWidth margin="dense" value={editData.deductions} onChange={(e) => setEditData({...editData, deductions: Number(e.target.value)})} />
          <TextField label="Tax Deducted" type="number" fullWidth margin="dense" value={editData.taxDeducted} onChange={(e) => setEditData({...editData, taxDeducted: Number(e.target.value)})} />
          <TextField label="Description" fullWidth margin="dense" multiline rows={2} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Commission Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={approveData.status} label="Status" onChange={(e) => setApproveData({...approveData, status: e.target.value})}>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Remarks" fullWidth margin="dense" multiline rows={3} value={approveData.remarks} onChange={(e) => setApproveData({...approveData, remarks: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveApprove} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommissionListPage;
