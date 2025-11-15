import React from 'react';
import { Alert, Box, Slide } from '@mui/material';
import { WifiOff } from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  return (
    <Slide direction="up" in={!isOnline} mountOnEnter unmountOnExit>
      <Box sx={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999 }}>
        <Alert 
          severity="warning" 
          icon={<WifiOff />}
          sx={{ 
            boxShadow: 3,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          You are offline. Some features may not work properly.
        </Alert>
      </Box>
    </Slide>
  );
};