import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Warning, 
  Error, 
  ExpandMore, 
  ExpandLess,
  Security,
  MonetizationOn 
} from '@mui/icons-material';
import { api } from '../api/api';

interface RiskAlert {
  ticketId: string;
  userId: number;
  alertType: string;
  message: string;
  createdAt: string;
}

interface RiskAssessment {
  ticketId: string;
  riskLevel: string;
  riskScore: number;
  riskFactors: string[];
  requiresManualReview: boolean;
}

export const RiskAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/risk-management/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch risk alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (alertType: string) => {
    switch (alertType) {
      case 'HIGH_RISK_TRANSACTION': return 'error';
      case 'LIMIT_VIOLATION': return 'warning';
      case 'SUSPICIOUS_PATTERN': return 'info';
      default: return 'default';
    }
  };

  const getRiskIcon = (alertType: string) => {
    switch (alertType) {
      case 'HIGH_RISK_TRANSACTION': return <Error />;
      case 'LIMIT_VIOLATION': return <Warning />;
      case 'SUSPICIOUS_PATTERN': return <Security />;
      default: return <MonetizationOn />;
    }
  };

  if (loading) return null;

  if (alerts.length === 0) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          No active risk alerts - All transactions are within normal parameters
        </Typography>
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'warning.main' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            <Typography variant="h6" color="warning.main">
              Risk Alerts ({alerts.length})
            </Typography>
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <List dense sx={{ mt: 1 }}>
            {alerts.map((alert) => (
              <ListItem key={`${alert.ticketId}-${alert.alertType}`} sx={{ px: 0 }}>
                <ListItemIcon>
                  {getRiskIcon(alert.alertType)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                      <Chip 
                        label={alert.alertType.replace('_', ' ')} 
                        size="small" 
                        color={getRiskColor(alert.alertType)}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Ticket: {alert.ticketId} • {new Date(alert.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};