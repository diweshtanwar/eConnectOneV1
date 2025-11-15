import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';

interface BulkApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (approvalType: 'full' | 'percentage' | 'fixed', value: number, comment: string) => void;
  tickets: Array<{
    ticketId: string;
    summary: string;
    requestedAmount: number;
    ticketType: string;
  }>;
}

export const BulkApprovalDialog: React.FC<BulkApprovalDialogProps> = ({
  open,
  onClose,
  onApprove,
  tickets
}) => {
  const [approvalType, setApprovalType] = useState<'full' | 'percentage' | 'fixed'>('full');
  const [value, setValue] = useState('100');
  const [comment, setComment] = useState('');

  const totalAmount = tickets.reduce((sum, t) => sum + t.requestedAmount, 0);

  const handleApprove = () => {
    onApprove(approvalType, parseFloat(value), comment);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Approve {tickets.length} Tickets</DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Selected Tickets:</Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
            {tickets.map(ticket => (
              <ListItem key={ticket.ticketId}>
                <ListItemText
                  primary={ticket.summary}
                  secondary={`₹${ticket.requestedAmount.toLocaleString()}`}
                />
                <Chip label={ticket.ticketType} size="small" />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="primary">
            Total Amount: ₹{totalAmount.toLocaleString()}
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Approval Type</FormLabel>
          <RadioGroup
            value={approvalType}
            onChange={(e) => setApprovalType(e.target.value as any)}
          >
            <FormControlLabel value="full" control={<Radio />} label="Approve Full Amount" />
            <FormControlLabel value="percentage" control={<Radio />} label="Approve Percentage" />
            <FormControlLabel value="fixed" control={<Radio />} label="Fixed Amount Each" />
          </RadioGroup>
        </FormControl>

        {approvalType !== 'full' && (
          <TextField
            fullWidth
            label={approvalType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
          />
        )}

        <TextField
          fullWidth
          label="Bulk Approval Comment"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApprove} variant="contained" color="primary">
          Approve All
        </Button>
      </DialogActions>
    </Dialog>
  );
};