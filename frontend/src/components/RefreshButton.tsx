import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, disabled }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Tooltip title="Refresh Tickets">
      <IconButton 
        onClick={handleRefresh} 
        disabled={disabled || refreshing}
        size="small"
      >
        {refreshing ? <CircularProgress size={20} /> : <Refresh />}
      </IconButton>
    </Tooltip>
  );
};