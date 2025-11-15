import React from 'react';
import { Box, Typography, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

interface CommissionActivityLogPageProps {
  activityLog: any[];
}

const CommissionActivityLogPage: React.FC<CommissionActivityLogPageProps> = ({ activityLog }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2 }}>Commission Activity Log</Typography>
    {activityLog.length === 0 ? (
      <Alert severity="info">No activity log entries found.</Alert>
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
