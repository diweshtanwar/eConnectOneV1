import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Pagination,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  AccountBalanceWallet,
  History,
  TrendingUp,
  TrendingDown,
  ViewModule,
  ViewList,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

interface Wallet {
  walletId: string;
  balance: number;
  pendingAmount: number;
  isActive: boolean;
}

interface WalletTransaction {
  transactionId: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  status: string;
  createdDate: string;
  ticket?: {
    ticketId: string;
    summary: string;
  };
}

export const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [error, setError] = useState<string>('');
  const pageSize = 20;
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');


  useEffect(() => {
    fetchWalletData();
  }, [page, statusFilter, typeFilter]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { type: typeFilter })
      });
      
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get('/wallet'),
        api.get(`/wallet/transactions?${params}`)
      ]);
      
      setWallet(walletResponse.data);
      setTransactions(transactionsResponse.data.transactions || transactionsResponse.data);
      setTotalPages(Math.ceil((transactionsResponse.data.totalPages || transactionsResponse.data.total || transactionsResponse.data.length) / pageSize));
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      setError(error.response?.data || error.message || 'Failed to load wallet data');
      setWallet(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchWalletData();
  };



  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DEPOSIT': return <TrendingUp color="success" />;
      case 'WITHDRAWAL': return <TrendingDown color="error" />;
      default: return <History />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet />
        My Wallet
      </Typography>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="error.main" sx={{ fontWeight: 500, background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 2, p: 2 }}>
            <b>Error:</b> {error}
            <br />
            <Typography variant="caption">Your wallet may not be created yet. Please contact an administrator to set up your wallet.</Typography>
          </Typography>
        </Box>
      )}

      {/* Wallet Disclaimer Note */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2, p: 2 }}>
          <b>Note:</b> The wallet balance shown here is maintained by the system for reference and reconciliation purposes only. It may not reflect the actual amount in your linked bank account. For accurate financial records, always verify your bank account statement. Differences may occur due to pending transactions, deposits, or system processing. This wallet balance is <u>not</u> a direct representation of your bank account balance.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Balance
              </Typography>
              <Typography variant="h3" color="primary" gutterBottom>
                ₹{wallet?.balance !== undefined ? wallet.balance.toLocaleString() : '0.00'}
              </Typography>
              {wallet?.pendingAmount && wallet.pendingAmount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Pending: ₹{wallet.pendingAmount.toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wallet Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={wallet?.isActive ? 'Active' : 'Inactive'} 
                  color={wallet?.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  {wallet?.isActive ? 'Wallet is operational' : 'Wallet is disabled'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                  Transaction History
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">All Status</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="FAILED">Failed</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      label="Type"
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">All Types</MenuItem>
                      <MenuItem value="DEPOSIT">Deposit</MenuItem>
                      <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              {viewMode === 'tile' ? (
                <Grid container spacing={2}>
                  {transactions.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography align="center" color="text.secondary">
                        No transactions found
                      </Typography>
                    </Grid>
                  ) : (
                    transactions.map((transaction) => (
                      <Grid item xs={12} sm={6} md={4} key={transaction.transactionId}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getTransactionIcon(transaction.transactionType)}
                                <Typography variant="body2" fontWeight="bold">
                                  {transaction.transactionType}
                                </Typography>
                              </Box>
                              <Chip
                                label={transaction.status}
                                color={getStatusColor(transaction.status)}
                                size="small"
                              />
                            </Box>
                            <Typography
                              variant="h5"
                              color={
                                transaction.transactionType === 'DEPOSIT' ? 'success.main' : 
                                transaction.transactionType === 'WITHDRAWAL' ? 'error.main' : 'inherit'
                              }
                              sx={{ mb: 1 }}
                            >
                              {transaction.transactionType === 'WITHDRAWAL' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(transaction.createdDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Balance After: ₹{transaction.balanceAfter.toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Balance After</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.transactionId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getTransactionIcon(transaction.transactionType)}
                              {transaction.transactionType}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={
                                transaction.transactionType === 'DEPOSIT' ? 'success.main' : 
                                transaction.transactionType === 'WITHDRAWAL' ? 'error.main' : 'inherit'
                              }
                            >
                              {transaction.transactionType === 'WITHDRAWAL' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              color={getStatusColor(transaction.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.createdDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{transaction.balanceAfter.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </TableContainer>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>


    </Box>
  );
};