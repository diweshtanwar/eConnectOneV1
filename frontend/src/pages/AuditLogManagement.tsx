import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api/api';

interface AuditLog {
  id: number;
  entityName?: string;
  entityId?: number;
  action?: string;
  changes?: string;
  timestamp: string;
  changedBy?: string;
}

export function AuditLogManagement() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cutoffDate, setCutoffDate] = useState<string>('');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get<AuditLog[]>('/api/auditlogs');
      setAuditLogs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const handleCleanAuditLogs = async () => {
    if (!cutoffDate) {
      setError('Please select a cutoff date.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete audit logs before ${new Date(cutoffDate).toLocaleDateString()}?`)) {
      return;
    }

    try {
      setLoading(true);
      // The backend expects a DateTime, so ensure the format is correct
      const response = await api.post(`/api/auditlogs/clean?cutoffDate=${cutoffDate}`);
      alert(response.data);
      loadAuditLogs(); // Reload logs after cleaning
    } catch (err) {
      setError('Failed to clean audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Audit Log Viewer
        </Typography>
        <Box>
          <TextField
            label="Clean logs before date"
            type="date"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleCleanAuditLogs}
          >
            Clean Logs
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Entity Name</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Changes</TableCell>
              <TableCell>Changed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.entityName}</TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.changes}</TableCell>
                <TableCell>{log.changedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}