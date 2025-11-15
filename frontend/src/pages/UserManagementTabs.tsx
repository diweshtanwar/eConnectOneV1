import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { UserManagement } from './UserManagement';
import CreateUser from './CreateUser';
import { UserDocumentCreate } from './UserDocumentCreate';
import { BulkImport } from '../components/BulkUserImport';
import { PasswordReset } from '../components/PasswordReset';
import { AccountLockout } from '../components/AccountLockout';
import { UserDetails } from './UserDetails';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export const UserManagementTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Users" />
        <Tab label="Bulk Import" />
        <Tab label="Password Reset" />
        <Tab label="Account Lockout" />
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setCreateDialogOpen(true)}>
          Create User
        </Button>
        <UserManagement />
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
            <CreateUser />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <BulkImport />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <PasswordReset />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <AccountLockout />
      </TabPanel>
    </Box>
  );
};