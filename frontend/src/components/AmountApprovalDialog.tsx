import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { Warning, CheckCircle, Cancel } from '@mui/icons-material';
import { walletValidationService } from '../services/walletValidationService';

interface AmountApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (approvedAmount: number, comment: string) => void;
  onReject: (comment: string) => void;
  ticket: {
    ticketId: string;
    summary: string;
    requestedAmount: number;
    ticketType: 'withdrawal' | 'deposit';
    requesterName: string;
    raisedByUserId: number;
  };
}

export const AmountApprovalDialog: React.FC<AmountApprovalDialogProps> = ({
  open,
  onClose,
  onApprove,
  onReject,
  ticket
}) => {
  const [approvedAmount, setApprovedAmount] = useState(ticket.requestedAmount.toString());
  const [comment, setComment] = useState('');
  const [balanceWarning, setBalanceWarning] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setApprovedAmount(ticket.requestedAmount.toString());
      setComment('');
      setBalanceWarning('');
    }
  }, [open, ticket.requestedAmount]);

  useEffect(() => {
    const checkBalance = async () => {
      if (ticket.ticketType === 'withdrawal' && approvedAmount) {
        const amount = parseFloat(approvedAmount);
        if (amount > 0) {
          const validation = await walletValidationService.validateWithdrawal(
            ticket.raisedByUserId,
            amount
          );
          if (validation.hasNegativeBalance) {
            setBalanceWarning(validation.message);
          } else {
            setBalanceWarning('');
          }
        }
      }
    };
    
    checkBalance();
  }, [approvedAmount, ticket.ticketType, ticket.raisedByUserId]);

  const handleApprove = async () => {
    const amount = parseFloat(approvedAmount);
    if (amount <= 0) return;
    
    setProcessing(true);
    await onApprove(amount, comment);
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    await onReject(comment);
    setProcessing(false);
  };

  const amountChanged = parseFloat(approvedAmount) !== ticket.requestedAmount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Approve {ticket.ticketType} Request
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Ticket Details:</Typography>
          <Typography variant="body2">ID: {ticket.ticketId}</Typography>
          <Typography variant="body2">Summary: {ticket.summary}</Typography>
          <Typography variant="body2">Requester: {ticket.requesterName}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Amount Details:</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Requested Amount:</Typography>
            <Chip label={`₹${ticket.requestedAmount.toLocaleString()}`} color="primary" size="small" />
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Approved Amount"
          type="number"
          value={approvedAmount}
          onChange={(e) => setApprovedAmount(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
          }}
        />

        {amountChanged && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Amount changed from ₹{ticket.requestedAmount.toLocaleString()} to ₹{parseFloat(approvedAmount).toLocaleString()}
          </Alert>
        )}

        {balanceWarning && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {balanceWarning}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Approval Comment"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          margin="normal"
          placeholder="Add reason for approval/rejection or amount change..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button 
          onClick={handleReject} 
          color="error" 
          variant="outlined"
          disabled={processing}
          startIcon={<Cancel />}
        >
          Reject
        </Button>
        <Button 
          onClick={handleApprove} 
          color="success" 
          variant="contained"
          disabled={processing || !approvedAmount || parseFloat(approvedAmount) <= 0}
          startIcon={<CheckCircle />}
        >
          Approve ₹{parseFloat(approvedAmount || '0').toLocaleString()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};