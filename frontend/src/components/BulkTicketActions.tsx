import React, { useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, Alert } from '@mui/material';
import { CheckCircle, Cancel, Assignment } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';

interface BulkTicketActionsProps {
  tickets: TicketDto[];
  selectedTickets: string[];
  onSelectionChange: (ticketIds: string[]) => void;
  onBulkUpdate: (updatedTickets: TicketDto[]) => void;
  onError: (error: string) => void;
  ticketStatuses: Array<{ id: number; name: string }>;
}

export const BulkTicketActions: React.FC<BulkTicketActionsProps> = ({
  tickets,
  selectedTickets,
  onSelectionChange,
  onBulkUpdate,
  onError,
  ticketStatuses
}) => {
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<number>(0);
  const [bulkComment, setBulkComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tickets.map(t => t.ticketId));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'custom') => {
    if (selectedTickets.length === 0) return;

    let statusId = bulkStatus;
    let comment = bulkComment;

    if (action === 'approve') {
      statusId = 2; // In Progress
      comment = 'Bulk approved for processing';
    } else if (action === 'reject') {
      statusId = 4; // Rejected
      comment = bulkComment || 'Bulk rejected';
    }

    if (action === 'reject' && !comment.trim()) {
      onError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const updatePromises = selectedTickets.map(ticketId =>
        ticketsApi.updateTicket(ticketId, {
          ticketId,
          statusId,
          comment
        })
      );

      const updatedTickets = await Promise.all(updatePromises);
      onBulkUpdate(updatedTickets);
      onSelectionChange([]);
      setBulkActionOpen(false);
      setBulkComment('');
    } catch (err) {
      onError('Failed to perform bulk action');
    } finally {
      setProcessing(false);
    }
  };

  if (selectedTickets.length === 0) return null;

  return (
    <Box sx={{ 
      position: 'sticky', 
      top: 0, 
      bgcolor: 'background.paper', 
      p: 2, 
      borderBottom: 1, 
      borderColor: 'divider',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <Checkbox
        checked={selectedTickets.length === tickets.length}
        indeterminate={selectedTickets.length > 0 && selectedTickets.length < tickets.length}
        onChange={handleSelectAll}
      />
      
      <Typography variant="body2">
        {selectedTickets.length} selected
      </Typography>

      <Button
        size="small"
        variant="contained"
        color="success"
        startIcon={<CheckCircle />}
        onClick={() => handleBulkAction('approve')}
        disabled={processing}
      >
        Approve All
      </Button>

      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<Cancel />}
        onClick={() => setBulkActionOpen(true)}
        disabled={processing}
      >
        Reject All
      </Button>

      <Button
        size="small"
        variant="outlined"
        startIcon={<Assignment />}
        onClick={() => setBulkActionOpen(true)}
        disabled={processing}
      >
        Custom Action
      </Button>

      <Dialog open={bulkActionOpen} onClose={() => setBulkActionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Action - {selectedTickets.length} tickets</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This action will be applied to all {selectedTickets.length} selected tickets.
          </Alert>
          
          <TextField
            select
            label="New Status"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(Number(e.target.value))}
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
            label="Comment/Reason"
            multiline
            rows={3}
            value={bulkComment}
            onChange={(e) => setBulkComment(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Provide a reason for this bulk action..."
            required={bulkStatus === 4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleBulkAction('custom')}
            variant="contained"
            disabled={processing || (bulkStatus === 4 && !bulkComment.trim())}
          >
            {processing ? 'Processing...' : 'Apply to All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};