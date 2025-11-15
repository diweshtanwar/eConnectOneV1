import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, TextField, IconButton, Avatar, Badge, Divider, Button, Chip, MenuItem, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Fab } from '@mui/material';
import { Send, Refresh, Group, Email, ChatBubble, Add, Edit } from '@mui/icons-material';
import { chatApi, messagesApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

interface Conversation {
  id: string;
  type: 'chat' | 'message';
  title: string;
  lastContent: string;
  lastTime: string;
  unreadCount: number;
  isGroup?: boolean;
  memberCount?: number;
  priority?: string;
  fromUser?: string;
}

interface ChatMessage {
  id: number;
  content: string;
  createdAt: string;
  isOwn: boolean;
  fromUser: string;
}

export const Communications: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filters, setFilters] = useState({ search: '', type: 'ALL' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeType, setComposeType] = useState<'chat' | 'message'>('chat');
  const [compose, setCompose] = useState({
    to: '',
    subject: '',
    message: '',
    priority: 'Normal'
  });
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchAllConversations();
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchAllConversations = async () => {
    try {
      const [chatData, messageData] = await Promise.all([
        chatApi.getConversations(),
        messagesApi.getInbox()
      ]);

      const chatConversations: Conversation[] = chatData.map((chat: any) => ({
        id: `chat_${chat.conversationId}`,
        type: 'chat',
        title: chat.chatName,
        lastContent: chat.lastMessage,
        lastTime: chat.lastMessageTime,
        unreadCount: chat.unreadCount,
        isGroup: chat.isGroup,
        memberCount: chat.memberCount
      }));

      const messageConversations: Conversation[] = messageData.map((msg: any) => ({
        id: `message_${msg.id}`,
        type: 'message',
        title: msg.subject,
        lastContent: msg.body.substring(0, 50) + '...',
        lastTime: msg.createdAt,
        unreadCount: msg.isRead ? 0 : 1,
        priority: msg.priority,
        fromUser: msg.fromUser
      }));

      const allConversations = [...chatConversations, ...messageConversations]
        .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

      setConversations(allConversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const [type, id] = conversationId.split('_');
      let data;
      
      if (type === 'chat') {
        data = await chatApi.getMessages(id);
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          content: msg.message,
          createdAt: msg.createdAt,
          isOwn: msg.isOwn,
          fromUser: msg.fromUser
        })));
      } else {
        // For messages, show single message as conversation
        const messageData = messageData.find((m: any) => m.id.toString() === id);
        if (messageData) {
          setMessages([{
            id: messageData.id,
            content: messageData.body,
            createdAt: messageData.createdAt,
            isOwn: false,
            fromUser: messageData.fromUser
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const [type, id] = selectedConversation.split('_');
      
      if (type === 'chat') {
        await chatApi.sendMessage({
          conversationId: id,
          toUserId: 0,
          message: newMessage
        });
      }
      
      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchAllConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCompose = async () => {
    try {
      if (composeType === 'chat') {
        await chatApi.sendMessage({
          toUserId: parseInt(compose.to),
          message: compose.message
        });
      } else {
        await messagesApi.sendMessage({
          toUserId: parseInt(compose.to),
          subject: compose.subject,
          body: compose.message,
          priority: compose.priority
        });
      }
      
      setComposeOpen(false);
      setCompose({ to: '', subject: '', message: '', priority: 'Normal' });
      fetchAllConversations();
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 1 && conv.type !== 'chat') return false;
    if (activeTab === 2 && conv.type !== 'message') return false;
    if (filters.type === 'UNREAD' && conv.unreadCount === 0) return false;
    if (filters.search && !conv.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Communications</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setComposeOpen(true)}
            sx={{ mr: 1 }}
          >
            Compose
          </Button>
          <IconButton onClick={fetchAllConversations}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Chats" icon={<ChatBubble />} />
        <Tab label="Messages" icon={<Email />} />
      </Tabs>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Filter"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="UNREAD">Unread</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
        {/* Conversations List */}
        <Paper sx={{ width: 350, overflow: 'auto' }}>
          <List>
            {filteredConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                button
                onClick={() => setSelectedConversation(conversation.id)}
                sx={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: selectedConversation === conversation.id ? '#e3f2fd' : 'transparent'
                }}
              >
                <Avatar sx={{ mr: 2 }}>
                  {conversation.type === 'chat' ? 
                    (conversation.isGroup ? <Group /> : <ChatBubble />) : 
                    <Email />
                  }
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" noWrap>
                        {conversation.title}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Badge badgeContent={conversation.unreadCount} color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" noWrap>
                        {conversation.lastContent}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={conversation.type} 
                          size="small" 
                          color={conversation.type === 'chat' ? 'primary' : 'secondary'}
                        />
                        {conversation.priority && (
                          <Chip 
                            label={conversation.priority} 
                            size="small" 
                            color={conversation.priority === 'High' ? 'error' : 'default'}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Messages Area */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6">
                  {conversations.find(c => c.id === selectedConversation)?.title}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: message.isOwn ? '#1976d2' : '#f5f5f5',
                        color: message.isOwn ? 'white' : 'black'
                      }}
                    >
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Divider />
              
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Select a conversation to start
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant={composeType === 'chat' ? 'contained' : 'outlined'}
              onClick={() => setComposeType('chat')}
              startIcon={<ChatBubble />}
            >
              New Chat
            </Button>
            <Button 
              variant={composeType === 'message' ? 'contained' : 'outlined'}
              onClick={() => setComposeType('message')}
              startIcon={<Email />}
            >
              New Message
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="To"
            fullWidth
            margin="normal"
            value={compose.to}
            onChange={(e) => setCompose({...compose, to: e.target.value})}
          >
            <MenuItem value="user1">John Doe</MenuItem>
            <MenuItem value="user2">Jane Smith</MenuItem>
          </TextField>
          
          {composeType === 'message' && (
            <>
              <TextField
                label="Subject"
                fullWidth
                margin="normal"
                value={compose.subject}
                onChange={(e) => setCompose({...compose, subject: e.target.value})}
              />
              <TextField
                select
                label="Priority"
                margin="normal"
                value={compose.priority}
                onChange={(e) => setCompose({...compose, priority: e.target.value})}
                sx={{ width: 150 }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </>
          )}
          
          <TextField
            label={composeType === 'chat' ? 'Message' : 'Content'}
            fullWidth
            multiline
            rows={6}
            margin="normal"
            value={compose.message}
            onChange={(e) => setCompose({...compose, message: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCompose}
            variant="contained"
            disabled={!compose.to || !compose.message}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};