import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, Receipt } from '@mui/icons-material';
import { analyticsApi } from '../api/api';
import { RefreshButton } from '../components/RefreshButton';

interface AnalyticsData {
  totalTransactions: number;
  totalVolume: number;
  withdrawalCount: number;
  depositCount: number;
  avgTransactionAmount: number;
  dailyTrend: Array<{ date: string; amount: number; count: number }>;
  topUsers: Array<{ userId: number; username: string; totalAmount: number }>;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboard();
      setData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <RefreshButton onRefresh={fetchAnalytics} />
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt color="primary" />
                <Box>
                  <Typography variant="h6">{data?.totalTransactions || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalance color="success" />
                <Box>
                  <Typography variant="h6">
                    ₹{data?.totalVolume?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingDown color="error" />
                <Box>
                  <Typography variant="h6">{data?.withdrawalCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Withdrawals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h6">{data?.depositCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deposits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Transaction */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Transaction Amount
              </Typography>
              <Typography variant="h4" color="primary">
                ₹{data?.avgTransactionAmount?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Users by Volume
              </Typography>
              {data?.topUsers?.map((user, index) => (
                <Box key={user.userId} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2">
                    {index + 1}. {user.username}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ₹{user.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};