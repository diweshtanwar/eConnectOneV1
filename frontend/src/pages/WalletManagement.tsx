import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, Grid, Chip, IconButton, Checkbox,
  FormControlLabel, Divider, Pagination, FormControl, InputLabel, Select, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Add, Edit, AccountBalanceWallet, Person, Upload, Download, ViewModule, ViewList } from '@mui/icons-material';
import { userApi, walletApi, riskManagementApi } from '../api/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  roleName: string;
}

interface UserWallet {
  walletId: string;
  userId: number;
  balance: number;
  pendingAmount: number;
  isActive: boolean;
  user: User;
}

interface UserLimit {
  userId: number;
  dailyWithdrawalLimit: number;
  monthlyWithdrawalLimit: number;
  singleTransactionLimit: number;
  minimumBalance: number;
}

export const WalletManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 50;
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [limitsDialog, setLimitsDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [adjustError, setAdjustError] = useState<any>(null);
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkDescription, setBulkDescription] = useState('');
  const [bulkType, setBulkType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [limits, setLimits] = useState<UserLimit>({
    userId: 0,
    dailyWithdrawalLimit: 25000,
    monthlyWithdrawalLimit: 500000,
    singleTransactionLimit: 10000,
    minimumBalance: -5000
  });
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [roleFilter, statusFilter, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const usersData = await userApi.getAllUsers(page, pageSize);
      setUsers(usersData);
      setTotalPages(Math.ceil(usersData.length / pageSize)); // This should come from API
      
      // Fetch wallets for current page users only
      const walletPromises = usersData.slice(0, 10).map(async (user) => {
        try {
          const wallet = await walletApi.getUserWallet(user.id);
          return { ...wallet, user };
        } catch {
          return null;
        }
      });
      
      const walletResults = await Promise.all(walletPromises);
      setWallets(walletResults.filter(w => w !== null) as UserWallet[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return;
    setAdjustError(null);
    
    try {
      const amount = adjustType === 'withdrawal' ? -parseFloat(adjustAmount) : parseFloat(adjustAmount);
      await walletApi.adjustBalance(
        selectedUser.id, 
        amount, 
        adjustDescription || `Admin ${adjustType}: ₹${adjustAmount}`
      );
      
      setMessage(`Successfully ${adjustType === 'deposit' ? 'deposited' : 'withdrew'} ₹${adjustAmount} ${adjustType === 'deposit' ? 'to' : 'from'} ${selectedUser.fullName || selectedUser.username}`);
      setAdjustDialog(false);
      setAdjustAmount('');
      setAdjustDescription('');
      setAdjustError(null);
      fetchData();
    } catch (error: any) {
      console.error('Adjust balance error:', error);
      setAdjustError({
        message: error.response?.data?.message || error.message || `Failed to process ${adjustType}`,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        fullError: JSON.stringify(error.response || error, null, 2)
      });
    }
  };

  const handleUpdateLimits = async () => {
    if (!selectedUser) return;
    
    try {
      await riskManagementApi.updateUserLimits(selectedUser.id, limits);
      
      setMessage(`Successfully updated limits for ${selectedUser.fullName || selectedUser.username}`);
      setLimitsDialog(false);
    } catch (error) {
      setMessage('Failed to update limits');
    }
  };

  const handleBulkOperation = async () => {
    if (selectedUsers.length === 0 || !bulkAmount) return;
    
    try {
      const amount = bulkType === 'withdrawal' ? -parseFloat(bulkAmount) : parseFloat(bulkAmount);
      
      const promises = selectedUsers.map(userId => 
        walletApi.adjustBalance(
          userId, 
          amount, 
          bulkDescription || `Bulk ${bulkType}: ₹${bulkAmount}`
        )
      );
      
      await Promise.all(promises);
      
      setMessage(`Successfully processed bulk ${bulkType} of ₹${bulkAmount} for ${selectedUsers.length} users`);
      setBulkDialog(false);
      setBulkAmount('');
      setBulkDescription('');
      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      setMessage(`Failed to process bulk ${bulkType}`);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const openBulkDialog = (type: 'deposit' | 'withdrawal') => {
    setBulkType(type);
    setBulkDialog(true);
  };

  const openAdjustDialog = (user: User, type: 'deposit' | 'withdrawal') => {
    setSelectedUser(user);
    setAdjustType(type);
    setAdjustAmount('');
    setAdjustDescription('');
    setAdjustError(null);
    setAdjustDialog(true);
  };

  const openLimitsDialog = async (user: User) => {
    setSelectedUser(user);
    try {
      const userLimits = await riskManagementApi.getUserLimits(user.id);
      setLimits(userLimits);
    } catch {
      // Use default limits if none exist
      setLimits({
        userId: user.id,
        dailyWithdrawalLimit: user.roleName === 'CSP' ? 25000 : 50000,
        monthlyWithdrawalLimit: user.roleName === 'CSP' ? 500000 : 1000000,
        singleTransactionLimit: user.roleName === 'CSP' ? 10000 : 25000,
        minimumBalance: user.roleName === 'CSP' ? -5000 : -10000
      });
    }
    setLimitsDialog(true);
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'error';
    if (balance < 1000) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccountBalanceWallet />
          Wallet Management
        </Typography>
        
        {/* Filters and View Toggle */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="CSP">CSP</MenuItem>
              <MenuItem value="HO User">HO User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchData}>
            Refresh
          </Button>
        </Box>
        
        {/* Bulk Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            startIcon={<Upload />}
            onClick={() => openBulkDialog('deposit')}
            disabled={selectedUsers.length === 0}
            color="success"
            size="small"
          >
            Bulk Deposit ({selectedUsers.length})
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={() => openBulkDialog('withdrawal')}
            disabled={selectedUsers.length === 0}
            color="error"
            size="small"
          >
            Bulk Withdrawal ({selectedUsers.length})
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.includes('Successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {viewMode === 'tile' ? (
        <Grid container spacing={2}>
          {users.map((user) => {
            const wallet = wallets.find(w => w.userId === user.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                      <Chip label={user.roleName} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Person />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {user.fullName || user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.username}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">Balance</Typography>
                      <Typography variant="h6" color={getBalanceColor(wallet?.balance || 0) + '.main'}>
                        ₹{wallet?.balance?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending: ₹{wallet?.pendingAmount?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={wallet?.isActive ? 'Active' : 'Inactive'} 
                      color={wallet?.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Add />}
                        onClick={() => openAdjustDialog(user, 'deposit')}
                        fullWidth
                      >
                        Deposit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<Download />}
                        onClick={() => openAdjustDialog(user, 'withdrawal')}
                        fullWidth
                      >
                        Withdraw
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => openLimitsDialog(user)}
                        fullWidth
                      >
                        Limits
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                User Wallets & Limits (Page {page} of {totalPages})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {users.length} users
              </Typography>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const wallet = wallets.find(w => w.userId === user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.fullName || user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.roleName} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`₹${wallet?.balance?.toLocaleString() || '0'}`}
                          color={getBalanceColor(wallet?.balance || 0)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>₹{wallet?.pendingAmount?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={wallet?.isActive ? 'Active' : 'Inactive'} 
                          color={wallet?.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Add />}
                            onClick={() => openAdjustDialog(user, 'deposit')}
                          >
                            Deposit
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Download />}
                            onClick={() => openAdjustDialog(user, 'withdrawal')}
                          >
                            Withdraw
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => openLimitsDialog(user)}
                          >
                            Limits
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Adjust Balance Dialog */}
      <Dialog open={adjustDialog} onClose={() => setAdjustDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {adjustType === 'deposit' ? 'Deposit to' : 'Withdraw from'} {selectedUser?.fullName || selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          {!adjustError && (
            <Alert severity={adjustType === 'deposit' ? 'info' : 'warning'} sx={{ mb: 2 }}>
              This will {adjustType === 'deposit' ? 'add' : 'deduct'} the amount {adjustType === 'deposit' ? 'to' : 'from'} the user's wallet balance.
            </Alert>
          )}
          {adjustError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">Error: {adjustError.message}</Typography>
              {adjustError.status && <Typography variant="body2">Status Code: {adjustError.status}</Typography>}
              {adjustError.url && <Typography variant="body2">Endpoint: {adjustError.method?.toUpperCase()} {adjustError.url}</Typography>}
              {adjustError.data && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" fontWeight="bold">Response Data:</Typography>
                  <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(adjustError.data, null, 2)}
                  </pre>
                </Box>
              )}
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" fontWeight="bold">Debug Info:</Typography>
                <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '150px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {adjustError.fullError}
                </pre>
              </Box>
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={adjustType}
                  label="Transaction Type"
                  onChange={(e) => setAdjustType(e.target.value as 'deposit' | 'withdrawal')}
                >
                  <MenuItem value="deposit">Deposit (Add Money)</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal (Deduct Money)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={adjustDescription}
                onChange={(e) => setAdjustDescription(e.target.value)}
                placeholder={`Reason for ${adjustType}...`}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAdjustDialog(false); setAdjustError(null); }}>Cancel</Button>
          <Button
            onClick={handleAdjustBalance}
            variant="contained"
            color={adjustType === 'deposit' ? 'success' : 'error'}
            disabled={!adjustAmount || parseFloat(adjustAmount) <= 0}
          >
            {adjustType === 'deposit' ? 'Deposit' : 'Withdraw'} ₹{adjustAmount}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Limits Dialog */}
      <Dialog open={limitsDialog} onClose={() => setLimitsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Update Limits for {selectedUser?.fullName || selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Daily Withdrawal Limit"
                type="number"
                value={limits.dailyWithdrawalLimit}
                onChange={(e) => setLimits({...limits, dailyWithdrawalLimit: parseFloat(e.target.value)})}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Monthly Withdrawal Limit"
                type="number"
                value={limits.monthlyWithdrawalLimit}
                onChange={(e) => setLimits({...limits, monthlyWithdrawalLimit: parseFloat(e.target.value)})}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Single Transaction Limit"
                type="number"
                value={limits.singleTransactionLimit}
                onChange={(e) => setLimits({...limits, singleTransactionLimit: parseFloat(e.target.value)})}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Minimum Balance (Negative Limit)"
                type="number"
                value={limits.minimumBalance}
                onChange={(e) => setLimits({...limits, minimumBalance: parseFloat(e.target.value)})}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimitsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateLimits} variant="contained">
            Update Limits
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Operations Dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk {bulkType === 'deposit' ? 'Deposit' : 'Withdrawal'} - {selectedUsers.length} Users
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will {bulkType === 'deposit' ? 'add' : 'deduct'} the specified amount {bulkType === 'deposit' ? 'to' : 'from'} all selected user wallets.
          </Alert>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`${bulkType === 'deposit' ? 'Deposit' : 'Withdrawal'} Amount`}
                type="number"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={bulkDescription}
                onChange={(e) => setBulkDescription(e.target.value)}
                placeholder={`Reason for bulk ${bulkType}...`}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Selected Users: {selectedUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount: ₹{(parseFloat(bulkAmount) || 0) * selectedUsers.length}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBulkOperation}
            variant="contained"
            color={bulkType === 'deposit' ? 'success' : 'error'}
            disabled={!bulkAmount || parseFloat(bulkAmount) <= 0 || selectedUsers.length === 0}
          >
            {bulkType === 'deposit' ? 'Deposit' : 'Withdraw'} ₹{bulkAmount} × {selectedUsers.length}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};