import React from 'react';
import { Box, Button, ButtonGroup, Tooltip } from '@mui/material';
import { CheckCircle, Cancel, Edit, Speed } from '@mui/icons-material';

interface QuickActionsProps {
  ticket: {
    ticketId: string;
    typeId: number;
    statusId: number;
    withdrawalDetail?: { amount: number };
    depositDetail?: { amount: number };
  };
  onQuickApprove: (ticketId: string) => void;
  onQuickReject: (ticketId: string) => void;
  onCustomApprove: (ticketId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  ticket,
  onQuickApprove,
  onQuickReject,
  onCustomApprove
}) => {
  if (ticket.statusId !== 1) return null; // Only show for pending tickets

  const amount = ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0;
  const isLowAmount = amount <= 5000; // Quick approve for small amounts

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {isLowAmount && (
        <Tooltip title={`Quick approve ₹${amount.toLocaleString()}`}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => onQuickApprove(ticket.ticketId)}
            startIcon={<Speed />}
          >
            Quick
          </Button>
        </Tooltip>
      )}
      
      <Tooltip title="Approve with options">
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => onCustomApprove(ticket.ticketId)}
          startIcon={<Edit />}
        >
          Approve
        </Button>
      </Tooltip>
      
      <Tooltip title="Quick reject">
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => onQuickReject(ticket.ticketId)}
          startIcon={<Cancel />}
        >
          Reject
        </Button>
      </Tooltip>
    </Box>
  );
};