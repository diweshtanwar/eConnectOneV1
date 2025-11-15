import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  IconButton,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Message,
  Chat,
  Assignment,
  Notifications,
  MarkEmailRead,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { broadcastApi, messagesApi, chatApi } from '../api/api';
import { enhancedCache } from '../utils/enhancedCache';

interface Notification {
  id: string;
  type: 'message' | 'chat' | 'broadcast' | 'ticket';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  from?: string;
  path?: string;
}

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      // Check cache first
      const cacheKey = 'notifications-list';
      const cached = enhancedCache.get<Notification[]>(cacheKey);
      if (cached) {
        setNotifications(cached);
        setUnreadCount(cached.filter(n => !n.isRead).length);
        return;
      }

      const [broadcasts, messages, chatConversations] = await Promise.all([
        broadcastApi.getNotifications().catch(() => []),
        messagesApi.getInbox().catch(() => []),
        chatApi.getConversations().catch(() => []),
      ]);

      const notificationList: Notification[] = [
        ...broadcasts.map((b: any) => ({
          id: `broadcast-${b.id}`,
          type: 'broadcast' as const,
          title: 'System Broadcast',
          content: b.message || 'New system notification',
          timestamp: b.sentAt || b.createdAt,
          isRead: b.isRead || false,
          from: 'System',
          path: '/messages',
        })),
        ...messages.slice(0, 5).map((m: any) => ({
          id: `message-${m.id}`,
          type: 'message' as const,
          title: m.subject || 'New Message',
          content: (m.body || '').substring(0, 100) + (m.body?.length > 100 ? '...' : ''),
          timestamp: m.createdAt,
          isRead: m.isRead || false,
          from: m.fromUser || 'Unknown',
          path: '/messages',
        })),
        ...chatConversations.slice(0, 3).map((c: any) => ({
          id: `chat-${c.id}`,
          type: 'chat' as const,
          title: `Chat: ${c.name || 'Group Chat'}`,
          content: c.lastMessage || 'New chat message',
          timestamp: c.lastMessageAt || c.createdAt,
          isRead: c.hasUnreadMessages === false,
          from: c.lastMessageFrom || 'Chat',
          path: '/chat',
        })),
      ];

      notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const finalList = notificationList.slice(0, 10);
      
      // Cache the results
      enhancedCache.set(cacheKey, finalList, 60000); // Cache for 1 minute
      
      setNotifications(finalList);
      setUnreadCount(finalList.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      if (notification.type === 'broadcast') {
        const id = notification.id.replace('broadcast-', '');
        await broadcastApi.deleteNotification?.(parseInt(id));
      } else if (notification.type === 'message') {
        const id = notification.id.replace('message-', '');
        await messagesApi.deleteMessage?.(parseInt(id));
      } else if (notification.type === 'chat') {
        const id = notification.id.replace('chat-', '');
        await chatApi.deleteConversation?.(id);
      }
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to specific page based on notification type
    switch (notification.type) {
      case 'message':
      case 'broadcast':
        navigate('/messages');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'ticket':
        navigate('/tickets');
        break;
      default:
        if (notification.path) {
          navigate(notification.path);
        }
    }
    onClose();
  };

  const deleteAllNotifications = async () => {
    try {
      // Delete all notifications for each type
      for (const notification of notifications) {
        if (notification.type === 'broadcast') {
          const id = notification.id.replace('broadcast-', '');
          await broadcastApi.deleteNotification?.(parseInt(id));
        } else if (notification.type === 'message') {
          const id = notification.id.replace('message-', '');
          await messagesApi.deleteMessage?.(parseInt(id));
        } else if (notification.type === 'chat') {
          const id = notification.id.replace('chat-', '');
          await chatApi.deleteConversation?.(id);
        }
      }
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        if (notification.type === 'broadcast') {
          const id = notification.id.replace('broadcast-', '');
          await broadcastApi.markAsRead(parseInt(id));
        } else if (notification.type === 'message') {
          const id = notification.id.replace('message-', '');
          await messagesApi.markAsRead(parseInt(id));
        } else if (notification.type === 'chat') {
          const id = notification.id.replace('chat-', '');
          await chatApi.markAsRead(id);
        }
      }
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <Message />;
      case 'chat': return <Chat />;
      case 'broadcast': return <Notifications />;
      case 'ticket': return <Assignment />;
      default: return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'primary';
      case 'chat': return 'success';
      case 'broadcast': return 'warning';
      case 'ticket': return 'info';
      default: return 'default';
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 500,
          borderRadius: 2,
          mt: 1,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={deleteAllNotifications}
              >
                Delete all
              </Button>
            )}
          </Box>
        </Box>
        {unreadCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNotification(notification)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getNotificationColor(notification.type)}.main`,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                        noWrap
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={getNotificationColor(notification.type) as any}
                        sx={{ fontSize: '0.7rem', height: 18 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notification.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.from && `From: ${notification.from} • `}
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.isRead && (
                  <Badge
                    color="primary"
                    variant="dot"
                    sx={{ mr: 1 }}
                  />
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary" align="center">
                  No notifications
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            navigate('/messages');
            onClose();
          }}
        >
          View All Messages
        </Button>
      </Box>
    </Popover>
  );
};