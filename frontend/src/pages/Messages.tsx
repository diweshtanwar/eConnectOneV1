import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton, Badge, Alert, Card, CardContent, CardActions, ToggleButtonGroup, ToggleButton, Grid } from '@mui/material';
import { Send, Refresh, ViewModule, ViewList } from '@mui/icons-material';
import { messagesApi, userApi } from '../api/api';

interface MessageType {
  id: number;
  subject: string;
  body: string;
  priority: string;
  fromUser: string;
  toUser?: string;
  isRead: boolean;
  createdAt: string;
}

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [sentMessages, setSentMessages] = useState<MessageType[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  useEffect(() => {
    fetchMessages();
    fetchSentMessages();
  }, []);

  useEffect(() => {
    if (composeOpen) {
      fetchUsers();
    }
  }, [composeOpen]);

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
    try {
      const currentUserResponse = await userApi.getCurrentUser();
      const allUsersResponse = await userApi.getAllUsersWithFullDetails();
      
      console.log('Current user:', currentUserResponse);
      console.log('All users:', allUsersResponse);
      
      // Exclude current user and deleted users from the list
      const filteredUsers = allUsersResponse.filter((u: any) => 
        u.id !== currentUserResponse.id && !u.isDeleted && u.isActive
      );
      
      const userList = filteredUsers.map((u: any) => ({ 
        id: u.id, 
        name: u.fullName || u.username 
      }));
      
      setUsers(userList);
      console.log('Loaded users for dropdown:', userList);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.toUserId || !newMessage.subject || !newMessage.body) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setError('');
      const response = await messagesApi.sendMessage({
        toUserId: Number(newMessage.toUserId),
        subject: newMessage.subject,
        body: newMessage.body,
        priority: newMessage.priority
      });
      setSuccess('Message sent successfully!');
      setComposeOpen(false);
      setNewMessage({ toUserId: '', subject: '', body: '', priority: 'Normal' });
      await fetchSentMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send message');
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
            onClick={() => {
              setError('');
              setComposeOpen(true);
            }}
            sx={{ ml: 1 }}
          >
            Compose
          </Button>
        </Box>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs for Inbox/Sent */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
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
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="tile">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
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

      {viewMode === 'list' ? (
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
            {(activeTab === 'inbox' ? messages : sentMessages).length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" align="center">
                      {loading ? 'Loading messages...' : `No ${activeTab === 'inbox' ? 'inbox' : 'sent'} messages yet`}
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              (activeTab === 'inbox' ? messages : sentMessages)
                .filter(message => {
                  if (filters.priority !== 'ALL' && message.priority !== filters.priority) return false;
                  if (activeTab === 'inbox') {
                    if (filters.status === 'UNREAD' && message.isRead) return false;
                    if (filters.status === 'READ' && !message.isRead) return false;
                  }
                  const searchText = filters.search.toLowerCase();
                  if (searchText) {
                    const subjectMatch = message.subject.toLowerCase().includes(searchText);
                    const userMatch = activeTab === 'inbox' 
                      ? message.fromUser?.toLowerCase().includes(searchText)
                      : message.toUser?.toLowerCase().includes(searchText);
                    if (!subjectMatch && !userMatch) return false;
                  }
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
            )))
            }
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
                <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {selectedMessage.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{activeTab === 'inbox' ? 'From' : 'To'}:</strong> {activeTab === 'inbox' ? selectedMessage.fromUser : selectedMessage.toUser}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString('en-US', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </Typography>
                    <Chip 
                      label={selectedMessage.priority} 
                      size="small" 
                      color={getPriorityColor(selectedMessage.priority) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#333' }}>
                    {selectedMessage.body}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                <Box sx={{ fontSize: 64, color: '#bdbdbd' }}>📧</Box>
                <Typography variant="h6" color="text.secondary">
                  Select a message to view details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a message from the list to read its content
                </Typography>
              </Box>
            )}
          </Box>
          </Paper>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {(activeTab === 'inbox' ? messages : sentMessages).length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {loading ? 'Loading messages...' : `No ${activeTab === 'inbox' ? 'inbox' : 'sent'} messages yet`}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            (activeTab === 'inbox' ? messages : sentMessages)
              .filter(message => {
                if (filters.priority !== 'ALL' && message.priority !== filters.priority) return false;
                if (activeTab === 'inbox') {
                  if (filters.status === 'UNREAD' && message.isRead) return false;
                  if (filters.status === 'READ' && !message.isRead) return false;
                }
                const searchText = filters.search.toLowerCase();
                if (searchText) {
                  const subjectMatch = message.subject.toLowerCase().includes(searchText);
                  const userMatch = activeTab === 'inbox' 
                    ? message.fromUser?.toLowerCase().includes(searchText)
                    : message.toUser?.toLowerCase().includes(searchText);
                  if (!subjectMatch && !userMatch) return false;
                }
                return true;
              })
              .map((message) => (
                <Grid item xs={12} sm={6} md={4} key={message.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: !message.isRead && activeTab === 'inbox' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      backgroundColor: !message.isRead && activeTab === 'inbox' ? '#f0f7ff' : 'white',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (activeTab === 'inbox' && !message.isRead) {
                        handleMarkAsRead(message.id);
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        {!message.isRead && activeTab === 'inbox' && (
                          <Badge color="primary" variant="dot" sx={{ mr: 1 }} />
                        )}
                        <Chip 
                          label={message.priority} 
                          size="small" 
                          color={getPriorityColor(message.priority) as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: !message.isRead && activeTab === 'inbox' ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.subject}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.body}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>{activeTab === 'inbox' ? 'From' : 'To'}:</strong> {activeTab === 'inbox' ? message.fromUser : message.toUser}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(message.createdAt).toLocaleString('en-US', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          })}
                        </Typography>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))
          )}
        </Grid>
      )}

      {/* Message Detail Dialog for Tile View */}
      {viewMode === 'tile' && selectedMessage && (
        <Dialog
          open={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 600 }}>
            Message Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                {selectedMessage.subject}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{activeTab === 'inbox' ? 'From' : 'To'}:</strong> {activeTab === 'inbox' ? selectedMessage.fromUser : selectedMessage.toUser}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </Typography>
                <Chip 
                  label={selectedMessage.priority} 
                  size="small" 
                  color={getPriorityColor(selectedMessage.priority) as any}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#333' }}>
                {selectedMessage.body}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedMessage(null)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Compose Dialog */}
      <Dialog 
        open={composeOpen} 
        onClose={() => {
          setComposeOpen(false);
          setError('');
          setNewMessage({ toUserId: '', subject: '', body: '', priority: 'Normal' });
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white', 
            fontWeight: 600,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: '50%', 
            p: 1.5, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Send sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Compose New Message</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Send a message to another user</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, px: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#2c3e50', fontSize: '0.95rem' }}>
              Recipient *
            </Typography>
            <TextField
              select
              fullWidth
              value={newMessage.toUserId}
              onChange={(e) => setNewMessage({...newMessage, toUserId: e.target.value})}
              required
              placeholder="Select recipient"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  }
                }
              }}
            >
              <MenuItem value="" disabled>
                <em>Select a user to send message</em>
              </MenuItem>
              {users.length === 0 ? (
                <MenuItem value="" disabled>
                  <em>Loading users...</em>
                </MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 15,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Box>
                      <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#2c3e50', fontSize: '0.95rem' }}>
              Subject *
            </Typography>
            <TextField
              fullWidth
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              required
              placeholder="Enter message subject"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  }
                }
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#2c3e50', fontSize: '0.95rem' }}>
              Priority
            </Typography>
            <ToggleButtonGroup
              value={newMessage.priority}
              exclusive
              onChange={(e, value) => value && setNewMessage({...newMessage, priority: value})}
              fullWidth
              sx={{ 
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  border: '2px solid #e0e0e0',
                  '&.Mui-selected': {
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    borderColor: '#2c3e50',
                    '&:hover': {
                      backgroundColor: '#34495e',
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  }
                }
              }}
            >
              <ToggleButton value="Low">
                <Chip label="Low" size="small" color="info" sx={{ mr: 1 }} />
                Low Priority
              </ToggleButton>
              <ToggleButton value="Normal">
                <Chip label="Normal" size="small" color="default" sx={{ mr: 1 }} />
                Normal
              </ToggleButton>
              <ToggleButton value="High">
                <Chip label="High" size="small" color="error" sx={{ mr: 1 }} />
                High Priority
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#2c3e50', fontSize: '0.95rem' }}>
              Message *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={newMessage.body}
              onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
              required
              placeholder="Type your message here..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2c3e50',
                    borderWidth: 2
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {newMessage.body.length} characters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {newMessage.body.length > 0 ? 'Looking good!' : 'Start typing...'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, backgroundColor: '#f8f9fa', gap: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => {
              setComposeOpen(false);
              setError('');
              setNewMessage({ toUserId: '', subject: '', body: '', priority: 'Normal' });
            }}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderWidth: 2,
              borderColor: '#95a5a6',
              color: '#2c3e50',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#7f8c8d',
                backgroundColor: '#ecf0f1'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained"
            disabled={!newMessage.toUserId || !newMessage.subject || !newMessage.body}
            startIcon={<Send />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                boxShadow: '0 6px 16px rgba(44, 62, 80, 0.4)',
              },
              '&:disabled': {
                background: '#bdc3c7',
                color: '#ecf0f1'
              }
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
            </Box>
          );
        };