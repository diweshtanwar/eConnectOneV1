import React, { useState } from 'react';
import { Box, Button, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, Visibility, AttachFile, Comment } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';

interface QuickTicketActionsProps {
  ticket: TicketDto;
  onUpdate: (updatedTicket: TicketDto) => void;
  onError: (error: string) => void;
  ticketStatuses: Array<{ id: number; name: string }>;
}

export const QuickTicketActions: React.FC<QuickTicketActionsProps> = ({
  ticket,
  onUpdate,
  onError,
  ticketStatuses
}) => {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.statusId);
  const [quickComment, setQuickComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleQuickStatusChange = async (newStatusId: number, comment?: string) => {
    setProcessing(true);
    try {
      const updateData = {
        ticketId: ticket.ticketId,
        statusId: newStatusId,
        comment: comment || `Status changed to ${ticketStatuses.find(s => s.id === newStatusId)?.name}`
      };
      
      const updatedTicket = await ticketsApi.updateTicket(ticket.ticketId, updateData);
      onUpdate(updatedTicket);
      setQuickActionOpen(false);
      setQuickComment('');
    } catch (err) {
      onError('Failed to update ticket status');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'warning'; // Open
      case 2: return 'info'; // In Progress
      case 3: return 'success'; // Resolved
      case 4: return 'error'; // Rejected
      default: return 'default';
    }
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (ticket.statusId === 1) { // Open
      actions.push(
        <Tooltip key="approve" title="Approve/Process">
          <IconButton 
            size="small" 
            color="success"
            onClick={() => handleQuickStatusChange(2, 'Ticket approved and processing started')}
            disabled={processing}
          >
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    
    if (ticket.statusId === 2) { // In Progress
      actions.push(
        <Tooltip key="resolve" title="Mark as Resolved">
          <IconButton 
            size="small" 
            color="success"
            onClick={() => handleQuickStatusChange(3, 'Ticket resolved successfully')}
            disabled={processing}
          >
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    
    if (ticket.statusId !== 4) { // Not rejected
      actions.push(
        <Tooltip key="reject" title="Reject">
          <IconButton 
            size="small" 
            color="error"
            onClick={() => setQuickActionOpen(true)}
            disabled={processing}
          >
            <Cancel fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    return actions;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip 
        label={ticket.statusName} 
        color={getStatusColor(ticket.statusId)}
        size="small"
      />
      
      {ticket.attachments && ticket.attachments.length > 0 && (
        <Tooltip title={`${ticket.attachments.length} attachments`}>
          <AttachFile fontSize="small" color="action" />
        </Tooltip>
      )}
      
      {getQuickActions()}
      
      <Tooltip title="More Actions">
        <IconButton 
          size="small"
          onClick={() => setQuickActionOpen(true)}
        >
          <Comment fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={quickActionOpen} onClose={() => setQuickActionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Action - {ticket.summary}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Change Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(Number(e.target.value))}
            fullWidth
            margin="normal"
          >
            {ticketStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Quick Comment"
            multiline
            rows={3}
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Add a comment about this action..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickActionOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleQuickStatusChange(selectedStatus, quickComment)}
            variant="contained"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};