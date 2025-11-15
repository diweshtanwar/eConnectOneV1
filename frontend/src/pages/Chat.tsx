import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, TextField, IconButton, Avatar, Badge, Divider, Button, Chip, MenuItem } from '@mui/material';
import { Send, Refresh, Group, Add, ChatBubble } from '@mui/icons-material';
import { chatApi } from '../api/api';
import { GroupChatDialog } from '../components/GroupChatDialog';

interface Conversation {
  conversationId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  chatName: string;
  isGroup: boolean;
  memberCount: number;
}

interface ChatMessage {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  isOwn: boolean;
  fromUser: string;
}

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    search: ''
  });

  useEffect(() => {
    fetchConversations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      // Auto-refresh messages every 10 seconds
      const interval = setInterval(() => fetchMessages(selectedConversation), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);
      // Mark as read
      await chatApi.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await chatApi.sendMessage({
        conversationId: selectedConversation,
        toUserId: 0, // Will be determined by conversation
        message: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations(); // Update conversation list
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateGroup = async (groupName: string, memberIds: number[]) => {
    try {
      const response = await chatApi.sendMessage({
        toUserId: memberIds[0], // First member as primary recipient
        message: `${groupName} group created`,
        isGroup: true,
        groupName,
        groupMembers: memberIds
      });
      
      // Select the new group conversation
      setSelectedConversation(response.conversationId);
      fetchConversations();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Chat</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Group />}
            onClick={() => setGroupDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            New Group
          </Button>
          <IconButton onClick={fetchConversations}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search conversations..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">All Chats</MenuItem>
          <MenuItem value="GROUP">Groups</MenuItem>
          <MenuItem value="DIRECT">Direct</MenuItem>
          <MenuItem value="UNREAD">Unread</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        height: { xs: 'auto', md: '70vh' }
      }}>
        {/* Conversations List */}
        <Paper sx={{ 
          width: { xs: '100%', md: 300 }, 
          height: { xs: '40vh', md: 'auto' },
          overflow: 'auto' 
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6">Conversations</Typography>
          </Box>
          <List>
            {conversations
              .filter(conversation => {
                if (filters.type === 'GROUP' && !conversation.isGroup) return false;
                if (filters.type === 'DIRECT' && conversation.isGroup) return false;
                if (filters.type === 'UNREAD' && conversation.unreadCount === 0) return false;
                if (filters.search && !conversation.chatName.toLowerCase().includes(filters.search.toLowerCase())) return false;
                return true;
              })
              .map((conversation) => (
              <ListItem
                key={conversation.conversationId}
                button
                onClick={() => setSelectedConversation(conversation.conversationId)}
                sx={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: selectedConversation === conversation.conversationId ? '#e3f2fd' : 'transparent'
                }}
              >
                <Avatar sx={{ mr: 2 }}>
                  {conversation.isGroup ? <Group /> : conversation.chatName.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {conversation.chatName}
                        </Typography>
                        {conversation.isGroup && (
                          <Chip 
                            label={`${conversation.memberCount} members`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {conversation.unreadCount > 0 && (
                        <Badge badgeContent={conversation.unreadCount} color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {conversation.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(conversation.lastMessageTime).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Messages */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6">
              {selectedConversation ? 
                conversations.find(c => c.conversationId === selectedConversation)?.chatName || 'Chat' 
                : 'Chat Window'
              }
            </Typography>
          </Box>
          {selectedConversation ? (
            <>
              {/* Messages Area */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: { xs: 1, sm: 2 },
                height: { xs: '50vh', md: 'auto' }
              }}>
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
                        {message.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 1, 
                          opacity: 0.7,
                          textAlign: message.isOwn ? 'right' : 'left'
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Message Input */}
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                Select a conversation to start chatting
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      <GroupChatDialog
        open={groupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </Box>
  );
};