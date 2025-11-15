import React, { useEffect, useState } from 'react';
import { getAllBroadcasts, sendBroadcast, editBroadcast, deleteBroadcast } from '../api/api';
import { Card, CardContent, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, CircularProgress, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const emptyForm = { title: '', message: '', priority: 'Normal', targetRoles: 'All', expiresAt: '' };

const BroadcastManagement: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<number|null>(null);

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
    if (editId) {
      await editBroadcast(editId, form);
    } else {
      await sendBroadcast(form);
    }
    handleClose();
    fetchBroadcasts();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this broadcast?')) {
      await deleteBroadcast(id);
      fetchBroadcasts();
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Broadcast Management</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>Send New Broadcast</Button>
      <Box mt={2}>
        {broadcasts.length === 0 ? (
          <Typography>No broadcasts found.</Typography>
        ) : (
          broadcasts.map(b => (
            <Card key={b.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{b.title}</Typography>
                <Typography variant="body2" color="text.secondary">{b.message}</Typography>
                <Box mt={1} display="flex" gap={2} alignItems="center">
                  <Chip label={b.priority} color={b.priority === 'High' ? 'error' : 'primary'} size="small" />
                  <Typography variant="caption">To: {b.targetRoles}</Typography>
                  <Typography variant="caption">From: {b.sentBy}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{new Date(b.createdAt).toLocaleString()}</Typography>
                <Box mt={1}>
                  <IconButton onClick={() => handleOpen(b)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(b.id)}><DeleteIcon /></IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Broadcast' : 'Send New Broadcast'}</DialogTitle>
        <DialogContent>
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
