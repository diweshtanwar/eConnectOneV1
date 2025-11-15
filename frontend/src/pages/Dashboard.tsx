import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Assessment as AnalyticsIcon,
  AccountBalance as WalletIcon,
  Receipt as ReceiptIcon,
  TrendingUp,
  TrendingDown,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import { LightweightChart } from '../components/LightweightChart';
import { TicketIcon, ProfileIcon } from '../components/OptimizedIcons';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';
import { analyticsApi, dashboardApi } from '../api/api';

interface DashboardStats {
  withdrawalRequests: { open: number; closed: number };
  depositRequests: { open: number; closed: number };
  supportRequests: { open: number; inProgress: number; closed: number };
  userCount: number;
  activeHOUsers: number;
}

interface AnalyticsData {
  totalTransactions: number;
  totalVolume: number;
  withdrawalCount: number;
  depositCount: number;
  avgTransactionAmount: number;
  topUsers: Array<{ userId: number; username: string; totalAmount: number }>;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.roleName === 'Master Admin' || user?.roleName === 'Admin' || user?.roleName === 'HO User';

  const dashboardFilters: FilterOption[] = [
    { key: 'dateRange', label: 'Date Range', type: 'dateRange' },
    { key: 'userType', label: 'User Type', type: 'select', options: [
      { value: 'all', label: 'All Users' },
      { value: 'ho', label: 'HO User' },
      { value: 'admin', label: 'Admin' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const fetchDashboardData = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats(filters);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (filters?: FilterValues) => {
    if (isAdmin) {
      try {
        const data = await analyticsApi.getDashboard();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    }
  };

  const handleSearch = (searchFilters: FilterValues) => {
    setFilterValues(searchFilters);
    fetchDashboardData(searchFilters);
    fetchAnalytics(searchFilters);
  };

  useEffect(() => {
    fetchDashboardData(filterValues);
    fetchAnalytics(filterValues);
  }, []);

  // Debounced filter application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(filterValues).length > 0) {
        fetchDashboardData(filterValues);
        fetchAnalytics(filterValues);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValues]);


  const withdrawalChartData = stats ? [
    { label: 'Open', value: stats.withdrawalRequests.open, color: theme.palette.warning.main },
    { label: 'Closed', value: stats.withdrawalRequests.closed, color: theme.palette.success.main }
  ] : [];

  const depositChartData = stats ? [
    { label: 'Open', value: stats.depositRequests.open, color: theme.palette.warning.main },
    { label: 'Closed', value: stats.depositRequests.closed, color: theme.palette.success.main }
  ] : [];

  const supportChartData = stats ? [
    { label: 'Open', value: stats.supportRequests.open, color: theme.palette.error.main },
    { label: 'In Progress', value: stats.supportRequests.inProgress, color: theme.palette.warning.main },
    { label: 'Closed', value: stats.supportRequests.closed, color: theme.palette.success.main }
  ] : [];

  const quickActions = [
    { label: 'Create Ticket', icon: <AddIcon />, path: '/tickets/create', color: theme.palette.primary.main },
    { label: 'View Users', icon: <PeopleIcon />, path: '/users', color: theme.palette.secondary.main },
    ...(isAdmin ? [
      { label: 'Wallet Management', icon: <WalletIcon />, path: '/wallet-management', color: theme.palette.success.main },
  
      { label: 'Commission Mgmt', icon: <ReceiptIcon />, path: '/commission-management', color: theme.palette.warning.main },
      { label: 'System Settings', icon: <SettingsIcon />, path: '/system-settings', color: theme.palette.error.main },
    ] : [])
  ];

  return (
  <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome back, {user?.fullName || user?.username}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={user?.roleName} 
              color="primary" 
              size="small" 
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Refresh Dashboard Data">
            <IconButton color="primary" onClick={() => {
              setLoading(true);
              fetchDashboardData(filterValues);
              fetchAnalytics(filterValues);
            }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Chip 
              label="Admin Dashboard" 
              color="primary" 
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>
      
      {/* Filters for Admin/HO/Master Admin */}
      <DataFilters
        filters={dashboardFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => {
          setFilterValues({});
          fetchDashboardData({});
          fetchAnalytics({});
        }}
        onSearch={handleSearch}
        searchMode={true}
      />
      
      {/* Key Metrics */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats ? stats.userCount : ''}
            color={theme.palette.secondary.main}
            icon={<PeopleIcon />}
            trend={stats ? { value: 2.1, isPositive: true } : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active HO Users"
            value={stats ? stats.activeHOUsers : ''}
            color={theme.palette.info.main}
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="System Status"
            value={stats ? "Online" : ''}
            subtitle={stats ? "All systems operational" : ''}
            color={theme.palette.success.main}
            icon={<SecurityIcon />}
          />
        </Grid>
      </Grid>

      {/* Financial Analytics for Admins */}
      {isAdmin && (
        <>
                
           
          
          {/* Top Users Analytics */}
          {analytics?.topUsers && analytics.topUsers.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Users by Volume
              </Typography>
              <Grid container spacing={1}>
                {analytics.topUsers.slice(0, 5).map((user, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={user.userId}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: theme.palette.grey[50] }}>
                      <Typography variant="h6" color="primary">
                        #{index + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ₹{user.totalAmount.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}

      {/* Ticket Statistics */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Ticket Overview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
              <TicketIcon color="primary" />
              Withdrawal Requests
              {stats && (
                <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                  (Total: {(stats.withdrawalRequests?.open || 0) + (stats.withdrawalRequests?.closed || 0)})
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <LightweightChart data={withdrawalChartData} type="donut" size={120} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
              <TicketIcon color="secondary" />
              Deposit Requests
              {stats && (
                <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                  (Total: {(stats.depositRequests?.open || 0) + (stats.depositRequests?.closed || 0)})
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <LightweightChart data={depositChartData} type="donut" size={120} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
              <SupportIcon color="info" />
              Support Requests
              {stats && (
                <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                  (Total: {(stats.supportRequests?.open || 0) + (stats.supportRequests?.inProgress || 0) + (stats.supportRequests?.closed || 0)})
                </Typography>
              )}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LightweightChart data={supportChartData} type="bar" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Analytics for Admins/HO/Master Admin only */}
      {isAdmin && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Financial Analytics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Transactions"
                value={analytics ? analytics.totalTransactions : ''}
                color={theme.palette.primary.main}
                icon={<ReceiptIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Volume"
                value={analytics ? `₹${analytics.totalVolume?.toLocaleString()}` : ''}
                color={theme.palette.success.main}
                icon={<WalletIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Withdrawals"
                value={analytics ? analytics.withdrawalCount : ''}
                color={theme.palette.error.main}
                icon={<TrendingDown />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Deposits"
                value={analytics ? analytics.depositCount : ''}
                color={theme.palette.success.main}
                icon={<TrendingUp />}
              />
            </Grid>
          </Grid>
          {/* Top Users Analytics */}
          {analytics?.topUsers && analytics.topUsers.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Users by Volume
              </Typography>
              <Grid container spacing={1}>
                {analytics.topUsers.slice(0, 5).map((user, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={user.userId}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: theme.palette.grey[50] }}>
                      <Typography variant="h6" color="primary">
                        #{index + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ₹{user.totalAmount.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}
      {/* Contact Us, About Us, and Copyright Tiles */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.default,
                border: `1px solid ${theme.palette.success.main}`,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="success" sx={{ fontSize: 36 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  About Us
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                eConnectOne is a professional digital platform for HO and Admin operations.<br/>
                For custom modules, integrations, or white-label solutions, contact our business team.<br/>
                <b>Version:</b> 1.0.0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.default,
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 36 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Copyright
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                &copy; {new Date().getFullYear()} eConnectOne. All rights reserved.<br/>
                For product addons, licensing, or partnership inquiries:<br/>
                <b>Email:</b> <a href="mailto:business@econnectone.com" style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>business@econnectone.com</a><br/>
                <b>Phone:</b> <a href="tel:+919812345678" style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>+91-9812345678</a>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.default,
                border: `1px solid ${theme.palette.info.main}`,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SupportIcon color="primary" sx={{ fontSize: 36 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  Contact Us
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                For support, queries, or feedback:<br/>
                <b>Email:</b> <a href="mailto:support@econnectone.com" style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>support@econnectone.com</a><br/>
                <b>Phone:</b> <a href="tel:+919876543210" style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>+91-9876543210</a><br/>
                <b>Address:</b> 123, Main Street, Mumbai, India
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}