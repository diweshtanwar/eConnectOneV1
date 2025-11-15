import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Dashboard,
  Assignment,
  People,
  Message,
  Chat,
  Folder,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SearchResult {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const searchItems: SearchResult[] = [
    { title: 'Dashboard', description: 'View dashboard and analytics', path: '/dashboard', icon: <Dashboard />, category: 'Navigation' },
    { title: 'My Tickets', description: 'View and manage your tickets', path: '/tickets', icon: <Assignment />, category: 'Tickets' },
    { title: 'Create Ticket', description: 'Create a new support ticket', path: '/tickets/create', icon: <Assignment />, category: 'Tickets' },
    { title: 'Profile', description: 'View and edit your profile', path: '/profile', icon: <People />, category: 'Account' },
    ...(user?.roleName === 'Master Admin' ? [
      { title: 'User Management', description: 'Manage users and permissions', path: '/users', icon: <People />, category: 'Admin' },
      { title: 'Messages', description: 'Send and receive messages', path: '/messages', icon: <Message />, category: 'Communication' },
      { title: 'Chat', description: 'Real-time chat conversations', path: '/chat', icon: <Chat />, category: 'Communication' },
      { title: 'Resource Center', description: 'Access shared resources', path: '/resources', icon: <Folder />, category: 'Resources' },
      { title: 'System Settings', description: 'Configure system settings', path: '/settings', icon: <Settings />, category: 'Admin' },
    ] : []),
  ];

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults(searchItems.slice(0, 6)); // Show top 6 items when no query
    }
  }, [query]);

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  const handleClose = () => {
    onClose();
    setQuery('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mt: 8,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <TextField
            fullWidth
            placeholder="Search pages, features, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
        
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {results.length > 0 ? (
            results.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 20 }}
                        />
                      </Box>
                    }
                    secondary={item.description}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography color="text.secondary" align="center">
                    No results found for "{query}"
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
        
        <Box sx={{ p: 2, borderTop: '1px solid #eee', backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary">
            Press ESC to close • Use arrow keys to navigate
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};