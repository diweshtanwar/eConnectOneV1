import React, { useEffect, useState } from 'react';
import { getAllBroadcasts, sendBroadcast, editBroadcast, deleteBroadcast } from '../api/api';
import { Card, CardContent, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, CircularProgress, IconButton, Alert, Grid, Divider, Paper, Collapse } from '@mui/material';
import { Edit, Delete, Add, Campaign, ExpandMore, ExpandLess, Schedule, Person, Label } from '@mui/icons-material';

const emptyForm = { title: '', message: '', priority: 'Normal', targetRoles: 'All', expiresAt: '' };

const BroadcastManagement: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<number|null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchBroadcasts = () => {
    setLoading(true);
    getAllBroadcasts().then((data) => {
      setBroadcasts(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const handleOpen = (b?: any) => {
    if (b) {
      setEditId(b.id);
      setForm({ ...b, expiresAt: b.expiresAt ? b.expiresAt.substring(0, 16) : '' });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setForm(emptyForm); setEditId(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editId) {
        await editBroadcast(editId, form);
      } else {
        await sendBroadcast(form);
      }
      handleClose();
      fetchBroadcasts();
      setSuccess('Broadcast sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Broadcast error:', err);
      const errorMsg = err.response?.data?.title || 
                       err.response?.data?.message || 
                       err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 
                       err.message || 
                       'Failed to send broadcast. Please check all required fields.';
      setError(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this broadcast?')) {
      await deleteBroadcast(id);
      fetchBroadcasts();
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Campaign color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">Broadcast Management</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Send New Broadcast
        </Button>
      </Box>
      
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      
      {broadcasts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No broadcasts sent yet</Typography>
          <Typography variant="body2" color="text.secondary">Click "Send New Broadcast" to create your first broadcast</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {broadcasts.map(b => (
            <Grid item xs={12} key={b.id}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" mb={1}>{b.title}</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                        <Chip 
                          icon={<Label />} 
                          label={b.priority} 
                          color={getPriorityColor(b.priority) as any} 
                          size="small" 
                        />
                        <Chip 
                          label={`To: ${b.targetRoles}`} 
                          variant="outlined" 
                          size="small" 
                        />
                        <Chip 
                          icon={<Person />} 
                          label={`From: ${b.sentBy}`} 
                          variant="outlined" 
                          size="small" 
                        />
                        <Chip 
                          icon={<Schedule />} 
                          label={new Date(b.createdAt).toLocaleString()} 
                          variant="outlined" 
                          size="small" 
                        />
                        <Chip 
                          label={b.isActive ? 'Active' : 'Inactive'} 
                          color={b.isActive ? 'success' : 'default'} 
                          size="small" 
                        />
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton color="primary" onClick={() => handleOpen(b)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(b.id)} size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => setExpandedId(expandedId === b.id ? null : b.id)} size="small">
                        {expandedId === b.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Collapse in={expandedId === b.id}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                      {b.message}
                    </Typography>
                    {b.expiresAt && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Expires:</strong> {new Date(b.expiresAt).toLocaleString()}
                      </Typography>
                    )}
                  </Collapse>
                  
                  {expandedId !== b.id && (
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {b.message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Broadcast' : 'Send New Broadcast'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Message" name="message" value={form.message} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
          <TextField label="Priority" name="priority" value={form.priority} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Target Roles (comma separated)" name="targetRoles" value={form.targetRoles} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Expires At" name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleChange} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editId ? 'Update' : 'Send'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BroadcastManagement;
