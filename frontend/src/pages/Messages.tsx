import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton, Badge } from '@mui/material';
import { Message, Send, Reply, Delete, Refresh } from '@mui/icons-material';

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);
  const [newMessage, setNewMessage] = useState({
    toUserId: '',
    subject: '',
    body: '',
    priority: 'Normal'
  });
  const [filters, setFilters] = useState({
    priority: 'ALL',
    status: 'ALL',
    search: ''
  });

  useEffect(() => {
    fetchMessages();
    fetchSentMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getInbox();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getSent();
      setSentMessages(data);
    } catch (error) {
      console.error('Failed to fetch sent messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // Fetch users for compose dropdown
    // This would be from your existing user API
  };

  const handleSendMessage = async () => {
    try {
      await messagesApi.sendMessage({
        toUserId: Number(newMessage.toUserId),
        subject: newMessage.subject,
        body: newMessage.body,
        priority: newMessage.priority
      });
      setComposeOpen(false);
      setNewMessage({ toUserId: '', subject: '', body: '', priority: 'Normal' });
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await messagesApi.markAsRead(messageId);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Messages</Typography>
        <Box>
          <IconButton onClick={activeTab === 'inbox' ? fetchMessages : fetchSentMessages}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setComposeOpen(true)}
            sx={{ ml: 1 }}
          >
            Compose
          </Button>
        </Box>
      </Box>

      {/* Tabs for Inbox/Sent */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant={activeTab === 'inbox' ? 'contained' : 'outlined'}
          onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
          sx={{ mr: 1 }}
        >
          Inbox
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'contained' : 'outlined'}
          onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
        >
          Sent
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search messages..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Priority"
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">All Priority</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">All Messages</MenuItem>
          <MenuItem value="UNREAD">Unread</MenuItem>
          <MenuItem value="READ">Read</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        height: { xs: 'auto', md: '70vh' }
      }}>
        {/* Messages List */}
        <Paper sx={{ 
          flex: 1, 
          overflow: 'auto',
          height: { xs: '40vh', md: 'auto' },
          minHeight: { xs: '300px', md: 'auto' }
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6">{activeTab === 'inbox' ? 'Inbox' : 'Sent'}</Typography>
          </Box>
          <List>
            {(activeTab === 'inbox' ? messages : sentMessages)
              .filter(message => {
                if (filters.priority !== 'ALL' && message.priority !== filters.priority) return false;
                if (filters.status === 'UNREAD' && message.isRead) return false;
                if (filters.status === 'READ' && !message.isRead) return false;
                if (filters.search && !message.subject.toLowerCase().includes(filters.search.toLowerCase()) && 
                    !message.fromUser.toLowerCase().includes(filters.search.toLowerCase())) return false;
                return true;
              })
              .map((message) => (
              <ListItem
                key={message.id}
                button
                onClick={() => {
                  setSelectedMessage(message);
                  if (activeTab === 'inbox' && !message.isRead) {
                    handleMarkAsRead(message.id);
                  }
                }}
                sx={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: !message.isRead && activeTab === 'inbox' ? '#f5f5f5' : 'transparent'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!message.isRead && activeTab === 'inbox' && <Badge color="primary" variant="dot" />}
                      <Typography variant="subtitle1" sx={{ fontWeight: !message.isRead && activeTab === 'inbox' ? 'bold' : 'normal' }}>
                        {message.subject}
                      </Typography>
                      <Chip 
                        label={message.priority} 
                        size="small" 
                        color={getPriorityColor(message.priority) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {activeTab === 'inbox' ? `From: ${message.fromUser}` : `To: ${message.toUser || 'Group'}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Message Detail */}
        <Paper sx={{ 
          flex: 2, 
          height: { xs: '50vh', md: 'auto' },
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6">Message Details</Typography>
          </Box>
          <Box sx={{ flex: 1, p: { xs: 1, sm: 2 }, overflow: 'auto' }}>
            {selectedMessage ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedMessage.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  From: {selectedMessage.fromUser} • {new Date(selectedMessage.createdAt).toLocaleString()}
                </Typography>
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.body}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a message to view
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Compose Dialog */}
      <Dialog 
        open={composeOpen} 
        onClose={() => setComposeOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle>Compose Message</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="To"
            fullWidth
            margin="normal"
            value={newMessage.toUserId}
            onChange={(e) => setNewMessage({...newMessage, toUserId: e.target.value})}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            value={newMessage.subject}
            onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
          />
          
          <TextField
            select
            label="Priority"
            margin="normal"
            value={newMessage.priority}
            onChange={(e) => setNewMessage({...newMessage, priority: e.target.value})}
            sx={{ width: 150, mr: 2 }}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </TextField>
                  <TextField
                    label="Message"
                    fullWidth
                    multiline
                    rows={6}
                    margin="normal"
                    value={newMessage.body}
                    onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
                  <Button onClick={handleSendMessage} variant="contained">Send</Button>
                </DialogActions>
              </Dialog>
            </Box>
          );
        }