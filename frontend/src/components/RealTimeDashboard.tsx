import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Warning, CheckCircle } from '@mui/icons-material';

interface DashboardMetrics {
  totalBalance: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  todayTransactions: number;
  riskAlerts: number;
  processingTime: number; // Average in minutes
}

export const RealTimeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBalance: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
    todayTransactions: 0,
    riskAlerts: 0,
    processingTime: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon, color, trend }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={color}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`${trend > 0 ? '+' : ''}${trend}%`} 
              size="small" 
              color={trend > 0 ? 'success' : 'error'}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Real-time Transaction Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Wallet Balance"
            value={`₹${metrics.totalBalance.toLocaleString()}`}
            icon={<TrendingUp />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Withdrawals"
            value={metrics.pendingWithdrawals}
            icon={<TrendingDown />}
            color="warning.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Deposits"
            value={metrics.pendingDeposits}
            icon={<TrendingUp />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Risk Alerts"
            value={metrics.riskAlerts}
            icon={<Warning />}
            color={metrics.riskAlerts > 0 ? "error.main" : "success.main"}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Efficiency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average processing time: {metrics.processingTime} minutes
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.max(0, 100 - (metrics.processingTime * 10))} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Activity
              </Typography>
              <Typography variant="h4" color="primary">
                {metrics.todayTransactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transactions processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};