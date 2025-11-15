import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControlLabel, Checkbox, Box, Typography } from '@mui/material';
import { broadcastApi } from '../api/api';

interface BroadcastDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BroadcastDialog: React.FC<BroadcastDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    priority: 'Normal',
    targetRoles: 'All',
    hasExpiry: false,
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!broadcast.title.trim() || !broadcast.message.trim()) return;

    try {
      setLoading(true);
      await broadcastApi.sendBroadcast({
        title: broadcast.title,
        message: broadcast.message,
        priority: broadcast.priority,
        targetRoles: broadcast.targetRoles,
        expiresAt: broadcast.hasExpiry ? new Date(broadcast.expiresAt).toISOString() : undefined
      });
      
      setBroadcast({
        title: '',
        message: '',
        priority: 'Normal',
        targetRoles: 'All',
        hasExpiry: false,
        expiresAt: ''
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Send Broadcast Notification</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={broadcast.title}
          onChange={(e) => setBroadcast({...broadcast, title: e.target.value})}
          placeholder="Enter notification title..."
        />
        
        <TextField
          label="Message"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={broadcast.message}
          onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
          placeholder="Enter your message..."
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            select
            label="Priority"
            value={broadcast.priority}
            onChange={(e) => setBroadcast({...broadcast, priority: e.target.value})}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Normal">Normal</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </TextField>
          
          <TextField
            select
            label="Target Audience"
            value={broadcast.targetRoles}
            onChange={(e) => setBroadcast({...broadcast, targetRoles: e.target.value})}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Users</MenuItem>
            <MenuItem value="CSP">CSP Only</MenuItem>
            <MenuItem value="Admin">Admin Only</MenuItem>
            <MenuItem value="HO user">HO Users Only</MenuItem>
          </TextField>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={broadcast.hasExpiry}
                onChange={(e) => setBroadcast({...broadcast, hasExpiry: e.target.checked})}
              />
            }
            label="Set expiry date"
          />
          
          {broadcast.hasExpiry && (
            <TextField
              type="datetime-local"
              label="Expires At"
              fullWidth
              margin="normal"
              value={broadcast.expiresAt}
              onChange={(e) => setBroadcast({...broadcast, expiresAt: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          This notification will be sent to all selected users and appear in their notification panel.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSend} 
          variant="contained"
          disabled={!broadcast.title.trim() || !broadcast.message.trim() || loading}
        >
          {loading ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};