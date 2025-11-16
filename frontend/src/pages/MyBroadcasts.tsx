import React, { useEffect, useState } from 'react';
import { getMyBroadcasts, broadcastApi } from '../api/api';
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Grid, Divider, IconButton, Collapse, Alert } from '@mui/material';
import { ExpandMore, ExpandLess, Notifications, Schedule, Person, Label } from '@mui/icons-material';

const MyBroadcasts: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = () => {
    getMyBroadcasts()
      .then((data) => {
        console.log('My broadcasts data:', data);
        setBroadcasts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch broadcasts:', err);
        setError('Failed to load broadcasts');
        setLoading(false);
      });
  };

  const handleMarkAsRead = async (receiptId: number) => {
    try {
      await broadcastApi.markAsRead(receiptId);
      fetchBroadcasts();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Notifications color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">My Broadcasts</Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {broadcasts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No broadcasts received yet</Typography>
          <Typography variant="body2" color="text.secondary">You'll see notifications here when admins send broadcasts</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {broadcasts.map(b => (
            <Grid item xs={12} key={b.broadcastId || b.id}>
              <Card 
                sx={{ 
                  border: !b.isRead ? '2px solid' : '1px solid',
                  borderColor: !b.isRead ? 'primary.main' : 'divider',
                  boxShadow: !b.isRead ? 3 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" fontWeight="bold">{b.title}</Typography>
                        {!b.isRead && <Chip label="NEW" color="primary" size="small" />}
                      </Box>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                        <Chip 
                          icon={<Label />} 
                          label={b.priority || 'Normal'} 
                          color={getPriorityColor(b.priority) as any} 
                          size="small" 
                        />
                        <Chip 
                          icon={<Person />} 
                          label={`From: ${b.sentBy}`} 
                          variant="outlined" 
                          size="small" 
                        />
                        <Chip 
                          icon={<Schedule />} 
                          label={new Date(b.createdAt).toLocaleString()} 
                          variant="outlined" 
                          size="small" 
                        />
                      </Box>
                    </Box>
                    <IconButton onClick={() => setExpandedId(expandedId === b.broadcastId ? null : b.broadcastId)}>
                      {expandedId === b.broadcastId ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  
                  <Collapse in={expandedId === b.broadcastId}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                      {b.message}
                    </Typography>
                    
                    <Box display="flex" gap={2} mt={2}>
                      {b.targetRoles && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Target:</strong> {b.targetRoles}
                        </Typography>
                      )}
                      {b.expiresAt && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Expires:</strong> {new Date(b.expiresAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    
                    {!b.isRead && (
                      <Box mt={2}>
                        <Chip 
                          label="Mark as Read" 
                          color="primary" 
                          onClick={() => handleMarkAsRead(b.id)} 
                          clickable 
                        />
                      </Box>
                    )}
                    
                    {b.isRead && b.readAt && (
                      <Typography variant="caption" color="success.main" display="block" mt={2}>
                        ✓ Read on {new Date(b.readAt).toLocaleString()}
                      </Typography>
                    )}
                  </Collapse>
                  
                  {expandedId !== b.broadcastId && (
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {b.message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyBroadcasts;
