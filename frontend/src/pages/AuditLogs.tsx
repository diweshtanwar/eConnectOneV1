import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Stack, TextField, InputAdornment } from '@mui/material';
import { auditApi } from '../api/api';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';

interface AuditLogDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: number;
  username: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const auditFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'action', label: 'Action', type: 'select', options: [
      { value: 'CREATE', label: 'Create' },
      { value: 'UPDATE', label: 'Update' },
      { value: 'DELETE', label: 'Delete' },
      { value: 'LOGIN', label: 'Login' },
      { value: 'LOGOUT', label: 'Logout' }
    ]},
    { key: 'entityType', label: 'Entity Type', type: 'select', options: [
      { value: 'User', label: 'User' },
      { value: 'Ticket', label: 'Ticket' },
  // { value: 'CSP', label: 'CSP' },
      { value: 'Document', label: 'Document' }
    ]},
    { key: 'dateRange', label: 'Date Range', type: 'dateRange' },
    { key: 'username', label: 'Username', type: 'text' }
  ];

  // Placeholder: fetch logs from backend if available
  const fetchAuditLogs = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call to fetch logs
      setLogs([
        {
          id: '1',
          action: 'LOGIN',
          entityType: 'User',
          entityId: '123',
          userId: 123,
          username: 'admin',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1'
        },
        {
          id: '2',
          action: 'CREATE',
          entityType: 'Ticket',
          entityId: 'TKT-001',
          userId: 456,
          username: 'user1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Created technical support ticket'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };
  // --- Audit Log Deletion UI State ---
  const [deleteDate, setDeleteDate] = useState<string>('');
  const [deleteDays, setDeleteDays] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // Delete logs before a specific date
  const handleDeleteBeforeDate = async () => {
    if (!deleteDate) return;
    setDeleting(true);
    setDeleteMsg(null);
    try {
      await auditApi.cleanLogsBeforeDate(deleteDate);
      setDeleteMsg(`Logs before ${deleteDate} deleted.`);
      fetchAuditLogs();
    } catch (err) {
      setDeleteMsg('Failed to delete logs.');
    } finally {
      setDeleting(false);
    }
  };

  // Delete logs older than N days
  const handleDeleteOlderThanDays = async () => {
    if (!deleteDays || isNaN(Number(deleteDays))) return;
    setDeleting(true);
    setDeleteMsg(null);
    try {
      await auditApi.cleanLogsOlderThanDays(Number(deleteDays));
      setDeleteMsg(`Logs older than ${deleteDays} days deleted.`);
      fetchAuditLogs();
    } catch (err) {
      setDeleteMsg('Failed to delete logs.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (searchFilters: FilterValues) => {
    fetchAuditLogs(searchFilters);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getFilteredLogs = () => {
    let filtered = logs;
    
    if (filterValues.search) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        log.details?.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.action) {
      filtered = filtered.filter(log => log.action === filterValues.action);
    }
    if (filterValues.entityType) {
      filtered = filtered.filter(log => log.entityType === filterValues.entityType);
    }
    if (filterValues.username) {
      filtered = filtered.filter(log => 
        log.username.toLowerCase().includes(filterValues.username.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'primary';
      case 'LOGOUT': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Audit Logs</Typography>

      {/* --- Audit Log Deletion Controls --- */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Delete logs before date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={deleteDate}
            onChange={e => setDeleteDate(e.target.value)}
            disabled={deleting}
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteBeforeDate}
            disabled={!deleteDate || deleting}
          >
            Delete by Date
          </Button>
          <TextField
            label="Delete logs older than (days)"
            type="number"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">days</InputAdornment>
            }}
            value={deleteDays}
            onChange={e => setDeleteDays(e.target.value)}
            disabled={deleting}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteOlderThanDays}
            disabled={!deleteDays || isNaN(Number(deleteDays)) || deleting}
          >
            Delete by Days
          </Button>
        </Stack>
        {deleteMsg && (
          <Typography color={deleteMsg.startsWith('Failed') ? 'error' : 'success.main'} sx={{ mt: 1 }}>
            {deleteMsg}
          </Typography>
        )}
      </Paper>

      <DataFilters
        filters={auditFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        onSearch={handleSearch}
        searchMode={true}
      />

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity Type</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredLogs().map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.action} 
                    color={getActionColor(log.action) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.entityType}</TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.ipAddress || '-'}</TableCell>
                <TableCell>{log.details || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};