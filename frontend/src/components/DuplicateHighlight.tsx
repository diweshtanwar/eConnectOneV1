import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Tooltip,
} from '@mui/material';
import { Warning, ExpandMore, ExpandLess } from '@mui/icons-material';
import { duplicateDetectionService, DuplicateTicket } from '../services/duplicateDetectionService';

interface DuplicateHighlightProps {
  ticketId?: string;
  amount?: number;
  ticketType?: string;
}

export const DuplicateHighlight: React.FC<DuplicateHighlightProps> = ({
  ticketId,
  amount,
  ticketType
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateTicket[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (amount && ticketType && (ticketType.toLowerCase() === 'withdrawal' || ticketType.toLowerCase() === 'deposit')) {
      checkDuplicates();
    }
  }, [amount, ticketType]);

  const checkDuplicates = async () => {
    if (!amount || !ticketType) return;
    
    setLoading(true);
    try {
      const result = await duplicateDetectionService.checkDuplicateAmount(
        amount,
        ticketType.toUpperCase() as 'WITHDRAWAL' | 'DEPOSIT'
      );
      
      // Filter out current ticket if provided
      const filteredDuplicates = result.duplicates.filter(d => d.ticketId !== ticketId);
      setDuplicates(filteredDuplicates);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || duplicates.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        icon={<Warning />}
        action={
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            <strong>Duplicate Amount Alert:</strong> Found {duplicates.length} other {ticketType?.toLowerCase()} 
            request(s) with amount ₹{amount?.toLocaleString()} created today
          </Typography>
        </Box>
      </Alert>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Similar Requests Today:
          </Typography>
          <List dense>
            {duplicates.map((duplicate) => (
              <ListItem key={duplicate.ticketId} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">
                        {duplicate.summary}
                      </Typography>
                      <Chip 
                        label={duplicate.status} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Amount: ₹{duplicate.amount.toLocaleString()} • 
                      Created: {new Date(duplicate.createdDate).toLocaleTimeString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Box>
  );
};