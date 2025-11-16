import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { MonetizationOn, TrendingUp, Receipt, ViewModule, ViewList } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

interface Commission {
  commissionId: string;
  month: number;
  year: number;
  baseCommission: number;
  bonusCommission: number;
  deductions: number;
  totalCommission: number;
  taxDeducted: number;
  netPayable: number;
  status: string;
  description?: string;
  createdDate: string;
  paymentDate?: string;
  commissionBreakdowns?: CommissionBreakdown[];
}

interface CommissionBreakdown {
  serviceType: string;
  transactionCount: number;
  transactionVolume: number;
  commissionRate: number;
  commissionAmount: number;
}

export const MyCommissions: React.FC = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');

  useEffect(() => {
    fetchCommissions();
    fetchAvailableYears();
  }, [selectedYear, selectedMonth]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      let url = `/commission?year=${selectedYear}`;
      if (selectedMonth) url += `&month=${selectedMonth}`;
      const response = await api.get(url);
      setCommissions(response.data);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const response = await api.get('/commission/years');
      setAvailableYears(response.data);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'PAID': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const totalEarnings = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.netPayable, 0);

  const pendingAmount = commissions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.netPayable, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn />
          My Commissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="tile">
              <ViewModule fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value as number)}
            >
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
              onChange={(e) => setSelectedMonth(e.target.value as number)}
            >
              <MenuItem value=''>All</MenuItem>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{getMonthName(i + 1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Commission Disclaimer Note */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2, p: 2 }}>
          <b>Note:</b> The commission amounts listed here are based on our system records for your reference. Actual credited amounts may differ due to processing, deductions, or reconciliation with your branch or bank. If you notice any discrepancy, please coordinate with your branch and contact support for clarification or resolution.
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h5" color="success.main">
                    ₹{totalEarnings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Paid ({selectedYear})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt color="info" />
                <Box>
                  <Typography variant="h5" color="info.main">
                    ₹{pendingAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MonetizationOn color="primary" />
                <Box>
                  <Typography variant="h5" color="primary">
                    {commissions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commission Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {commissions.length === 0 ? (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Commission Records Found
          </Typography>
          <Typography>
            No commission records are available for {selectedYear}. 
            Commission statements are typically generated monthly by the admin team.
            Please contact support if you believe this is an error.
          </Typography>
        </Alert>
      ) : viewMode === 'tile' ? (
        <Grid container spacing={3}>
          {commissions.map((commission) => (
            <Grid item xs={12} md={6} lg={4} key={commission.commissionId}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setSelectedCommission(commission)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {getMonthName(commission.month)} {commission.year}
                    </Typography>
                    <Chip
                      label={commission.status}
                      color={getStatusColor(commission.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Base Commission</Typography>
                    <Typography variant="h6">₹{commission.baseCommission.toLocaleString()}</Typography>
                  </Box>
                  
                  {commission.bonusCommission > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Bonus</Typography>
                      <Typography variant="body1" color="success.main">
                        +₹{commission.bonusCommission.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {commission.deductions > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Deductions</Typography>
                      <Typography variant="body1" color="error.main">
                        -₹{commission.deductions.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Net Payable</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{commission.netPayable.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {commission.paymentDate && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Paid on: {new Date(commission.paymentDate).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Base Commission</TableCell>
                <TableCell>Bonus</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Tax</TableCell>
                <TableCell>Net Payable</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow 
                  key={commission.commissionId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCommission(commission)}
                >
                  <TableCell>{getMonthName(commission.month)} {commission.year}</TableCell>
                  <TableCell>₹{commission.baseCommission.toLocaleString()}</TableCell>
                  <TableCell>₹{commission.bonusCommission.toLocaleString()}</TableCell>
                  <TableCell>₹{commission.deductions.toLocaleString()}</TableCell>
                  <TableCell>₹{commission.taxDeducted.toLocaleString()}</TableCell>
                  <TableCell><strong>₹{commission.netPayable.toLocaleString()}</strong></TableCell>
                  <TableCell>
                    <Chip
                      label={commission.status}
                      color={getStatusColor(commission.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {commission.paymentDate 
                      ? new Date(commission.paymentDate).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Commission Detail Dialog */}
      {selectedCommission && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commission Details - {getMonthName(selectedCommission.month)} {selectedCommission.year}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Base Commission</Typography>
                  <Typography variant="h6">₹{selectedCommission.baseCommission.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Bonus Commission</Typography>
                  <Typography variant="h6">₹{selectedCommission.bonusCommission.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Deductions</Typography>
                  <Typography variant="h6">₹{selectedCommission.deductions.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Tax Deducted</Typography>
                  <Typography variant="h6">₹{selectedCommission.taxDeducted.toLocaleString()}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Net Payable Amount</Typography>
                <Typography variant="h5" color="primary">
                  ₹{selectedCommission.netPayable.toLocaleString()}
                </Typography>
              </Box>
              
              {selectedCommission.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedCommission.description}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};