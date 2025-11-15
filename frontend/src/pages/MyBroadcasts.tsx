import React, { useEffect, useState } from 'react';
import { getMyBroadcasts } from '../api/api';
import { Card, CardContent, Typography, Chip, Box, CircularProgress } from '@mui/material';

const MyBroadcasts: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBroadcasts().then((data) => {
      setBroadcasts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>My Broadcasts</Typography>
      {broadcasts.length === 0 ? (
        <Typography>No broadcasts received.</Typography>
      ) : (
        broadcasts.map(b => (
          <Card key={b.broadcastId || b.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{b.title}</Typography>
              <Typography variant="body2" color="text.secondary">{b.message}</Typography>
              <Box mt={1} display="flex" gap={2} alignItems="center">
                <Chip label={b.priority} color={b.priority === 'High' ? 'error' : 'primary'} size="small" />
                <Typography variant="caption">From: {b.sentBy}</Typography>
                {b.isRead ? <Chip label="Read" color="success" size="small" /> : <Chip label="Unread" color="warning" size="small" />}
              </Box>
              <Typography variant="caption" color="text.secondary">{new Date(b.createdAt).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default MyBroadcasts;
