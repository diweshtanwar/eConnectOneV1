import React from 'react';
import { Box, Typography, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

interface CommissionActivityLogPageProps {
  activityLog: any[];
}

const CommissionActivityLogPage: React.FC<CommissionActivityLogPageProps> = ({ activityLog }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2 }}>Commission Activity Log</Typography>
    {activityLog.length === 0 ? (
      <Alert severity="info">
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Activity Log - Coming Soon</Typography>
        <Typography variant="body2">
          This feature will track all commission-related activities including:
        </Typography>
        <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
          <li>Commission creation and modifications</li>
          <li>Status changes (Pending → Approved → Paid)</li>
          <li>User actions and timestamps</li>
          <li>Approval and rejection history</li>
        </ul>
        <Typography variant="body2">
          Currently, you can view all commissions in the "View Commissions" tab and manage them using the Edit, Delete, and Approve actions.
        </Typography>
      </Alert>
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityLog.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{log.date}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Box>
);

export default CommissionActivityLogPage;
