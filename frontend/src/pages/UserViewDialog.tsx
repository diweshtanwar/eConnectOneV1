import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Tabs, Tab, Chip, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { UserResponseDto } from '../api/api';

interface UserViewDialogProps {
  open: boolean;
  user: UserResponseDto | null;
  onClose: () => void;
}

const UserViewDialog: React.FC<UserViewDialogProps> = ({ open, user, onClose }) => {
  const [tab, setTab] = React.useState(0);
  if (!user) return null;
  const userDetails = user.generalDetails || user.userDetails;
  // Mock user documents for demonstration; replace with real data if available
  const userDocuments = user.documents || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="User" />
          <Tab label="User Details" />
          <Tab label="User Documents" />
        </Tabs>
        {tab === 0 && (
          <Box>
            <Typography><b>Full Name:</b> {user.fullName || '-'}</Typography>
            <Typography><b>Email:</b> {user.email || '-'}</Typography>
            <Typography><b>Role:</b> {user.roleName}</Typography>
            <Typography><b>Status:</b> <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} size="small" /></Typography>
            <Typography><b>Created:</b> {new Date(user.createdAt).toLocaleString()}</Typography>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            {userDetails ? (
              <>
                {Object.entries(userDetails).map(([key, value]) => (
                  <Typography key={key}><b>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</b> {value || '-'}</Typography>
                ))}
              </>
            ) : (
              <Typography color="text.secondary">No user details exist.</Typography>
            )}
          </Box>
        )}
        {tab === 2 && (
          <Box>
            {userDocuments.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Uploaded</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userDocuments.map((doc: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{doc.type || '-'}</TableCell>
                      <TableCell>{doc.name || '-'}</TableCell>
                      <TableCell>{doc.uploaded ? new Date(doc.uploaded).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No user documents exist.</Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserViewDialog;
