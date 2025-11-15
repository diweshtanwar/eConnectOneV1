import React from 'react';
import { Paper } from '@mui/material';
import CreateUserDetails from './CreateUserDetails';

export const UserDetails: React.FC = () => {
  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <CreateUserDetails />
    </Paper>
  );
};
