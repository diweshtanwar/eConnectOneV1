import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Box, Typography, List, ListItem, ListItemText, Checkbox } from '@mui/material';
import { userApi } from '../api/api';

interface User {
  id: number;
  username: string;
  fullName?: string;
}

interface GroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, memberIds: number[]) => void;
}

export const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  open,
  onClose,
  onCreateGroup
}) => {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers(1, 100);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName.trim(), selectedUsers);
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Group Chat</DialogTitle>
      <DialogContent>
        <TextField
          label="Group Name"
          fullWidth
          margin="normal"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name..."
        />
        
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Select Members ({selectedUsers.length} selected)
        </Typography>
        
        <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
          <List dense>
            {users.map((user) => (
              <ListItem key={user.id} button onClick={() => handleUserToggle(user.id)}>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                />
                <ListItemText 
                  primary={user.fullName || user.username}
                  secondary={user.username}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {selectedUsers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Selected members:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                return (
                  <Chip
                    key={userId}
                    label={user?.fullName || user?.username}
                    size="small"
                    onDelete={() => handleUserToggle(userId)}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCreate} 
          variant="contained"
          disabled={!groupName.trim() || selectedUsers.length === 0}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};