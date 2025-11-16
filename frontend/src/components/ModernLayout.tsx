import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  Chip,
  Divider,
  Paper,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowDropDown,
  Notifications,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Person,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel } from './NotificationPanel';
import { SessionTimer } from './SessionTimer';
import { broadcastApi, messagesApi, chatApi } from '../api/api';
import { useSmartPolling } from '../hooks/useSmartPolling';
import { enhancedCache } from '../utils/enhancedCache';

const drawerWidth = 280;
const collapsedWidth = 64;

interface LayoutProps {
  children: React.ReactNode;
  menuItems: { text: string; icon: React.ReactNode; path: string; badge?: number }[];
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, menuItems, title }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      // Check cache first
      const cacheKey = 'unread-count';
      const cached = enhancedCache.get<number>(cacheKey);
      if (cached !== null) {
        setUnreadCount(cached);
        return;
      }

      // Batch API calls for efficiency with better error handling
      const [broadcastResponse, messages, chatConversations] = await Promise.allSettled([
        broadcastApi.getUnreadCount(),
        messagesApi.getInbox(),
        chatApi.getConversations(),
      ]);

      const broadcastCount = broadcastResponse.status === 'fulfilled' 
        ? (typeof broadcastResponse.value === 'object' ? broadcastResponse.value.unreadCount || 0 : broadcastResponse.value || 0)
        : 0;
      const messageCount = messages.status === 'fulfilled' && Array.isArray(messages.value)
        ? messages.value.filter((m: any) => !m.isRead).length 
        : 0;
      const chatCount = chatConversations.status === 'fulfilled' && Array.isArray(chatConversations.value)
        ? chatConversations.value.filter((c: any) => c.hasUnreadMessages).length 
        : 0;

      const totalCount = broadcastCount + messageCount + chatCount;
      
      // Cache the result
      enhancedCache.set(cacheKey, totalCount, 60000); // Cache for 1 minute
      setUnreadCount(totalCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  };

  // Use smart polling instead of regular intervals
  useSmartPolling(fetchUnreadCount, {
    activeInterval: 30000,    // 30 seconds when active
    inactiveInterval: 120000, // 2 minutes when inactive
  });

  useEffect(() => {
    fetchUnreadCount(); // Initial fetch
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ 
        p: open ? 3 : 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'flex-start' : 'center',
        minHeight: 64,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        {open ? (
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            letterSpacing: '-0.5px'
          }}>
            eConnectOne
          </Typography>
        ) : (
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main, 
            width: 40, 
            height: 40,
            fontSize: '1rem',
            fontWeight: 700
          }}>
            eC
          </Avatar>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!open ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    px: open ? 2 : 1.5,
                    justifyContent: open ? 'flex-start' : 'center',
                    backgroundColor: isActiveRoute(item.path) 
                      ? theme.palette.primary.main + '15' 
                      : 'transparent',
                    color: isActiveRoute(item.path) 
                      ? theme.palette.primary.main 
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: isActiveRoute(item.path)
                        ? theme.palette.primary.main + '25'
                        : theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 0,
                      justifyContent: 'center',
                      color: 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text}
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                          fontWeight: isActiveRoute(item.path) ? 600 : 400,
                        }
                      }}
                    />
                  )}
                  {open && item.badge && (
                    <Chip 
                      label={item.badge} 
                      size="small" 
                      color="error"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Collapse Button */}
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              width: '100%',
              borderRadius: 2,
              py: 1.5,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              },
            }}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {!isMobile && (
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          

          {/* Company/Project Name and Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#1976d2" strokeWidth="2" fill="none"/>
                <path d="M10 16a6 6 0 1 0 12 0" stroke="#1976d2" strokeWidth="2" fill="none"/>
                <path d="M14 16h8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
        <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                eGramin | eConnectOne
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SessionTimer />
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <ThemeToggle />
            {user && (
              <Button
                onClick={(e) => setAnchorElUser(e.currentTarget)}
                sx={{ 
                  ml: 1,
                  textTransform: 'none',
                  color: 'inherit',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                }}
                endIcon={<ArrowDropDown />}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.75rem'
                  }}
                >
                  {user.fullName ? getInitials(user.fullName) : getInitials(user.username)}
                </Avatar>
                {!isMobile && (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.fullName || user.username}
                  </Typography>
                )}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); setAnchorElUser(null); }}>
          <Person sx={{ mr: 1, fontSize: '1rem' }} />
          Profile
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { logout(); navigate('/login'); }}>
          <Logout sx={{ mr: 1, fontSize: '1rem' }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.grey[50],
          minHeight: '100vh',
          pt: 8,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Paper
          elevation={0}
          sx={{
            m: { xs: 1, sm: 2, md: 3 },
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          {children}
        </Paper>
      </Box>

      {/* Footer */}

      {/* Global Search Dialog */}
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Notification Panel */}
      <NotificationPanel
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
      />
    </Box>
  );
};