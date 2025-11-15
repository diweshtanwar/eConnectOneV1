import React, { useState, useEffect } from 'react';
import { 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { AccessTime, Warning } from '@mui/icons-material';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../contexts/AuthContext';

export const SessionTimer: React.FC = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const [remainingTime, setRemainingTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    sessionService.setCallbacks(
      () => {
        // On timeout
        logout();
      },
      () => {
        // On warning
        setShowWarning(true);
      }
    );

    sessionService.start();

    const interval = setInterval(() => {
      const remaining = sessionService.getRemainingTime();
      setRemainingTime(remaining);
    }, 1000);

    return () => {
      clearInterval(interval);
      sessionService.stop();
    };
  }, [logout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    setShowWarning(false);
    sessionService.start(); // Reset timer
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<AccessTime />}
          label={formatTime(remainingTime)}
          size="small"
          color={remainingTime <= 120 ? 'error' : (remainingTime <= 300 ? 'warning' : 'default')}
          sx={{ 
            ml: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            '& .MuiChip-icon': {
              fontSize: '0.875rem'
            }
          }}
        />
        {remainingTime <= 300 && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            sx={{ minWidth: 0, px: 1, fontSize: '0.75rem', height: 28 }}
            onClick={handleExtendSession}
          >
            Reset
          </Button>
        )}
      </Box>

      <Dialog
        open={showWarning}
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Session Timeout Warning
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Your session will expire in <strong>{formatTime(remainingTime)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Stay Logged In" to extend your session, or you will be automatically logged out.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={logout} 
            color="inherit"
            variant="outlined"
          >
            Logout Now
          </Button>
          <Button 
            onClick={handleExtendSession} 
            color="primary"
            variant="contained"
            autoFocus
          >
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};