import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { FileUpload } from './FileUpload';

interface TicketTypeFileUploadProps {
  ticketType: number;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const getUploadConfig = (ticketType: number) => {
  switch (ticketType) {
    case 1: // Technical
      return {
        title: 'Technical Issue Evidence',
        description: 'Upload screenshots of error messages, system logs, or problem evidence',
        accept: 'image/*,.txt,.log,.pdf',
        placeholder: 'Screenshots, error logs, system diagnostics...',
        examples: ['Error screenshots', 'System logs', 'Diagnostic reports']
      };
    case 2: // Withdrawal
      return {
        title: 'Withdrawal Documentation',
        description: 'Upload bank statements, transaction receipts, or withdrawal requests',
        accept: 'image/*,.pdf,.doc,.docx',
        placeholder: 'Bank statements, transaction receipts...',
        examples: ['Bank statements', 'Transaction receipts', 'Withdrawal requests']
      };
    case 3: // Deposit
      return {
        title: 'Deposit Proof',
        description: 'Upload deposit slips, payment receipts, or transaction confirmations',
        accept: 'image/*,.pdf,.doc,.docx',
        placeholder: 'Deposit slips, payment receipts...',
        examples: ['Deposit slips', 'Payment receipts', 'Transaction confirmations']
      };
    default:
      return {
        title: 'Supporting Documents',
        description: 'Upload any relevant documents or images',
        accept: 'image/*,.pdf,.doc,.docx,.txt',
        placeholder: 'Any supporting documents...',
        examples: ['Documents', 'Images', 'Reports']
      };
  }
};

export const TicketTypeFileUpload: React.FC<TicketTypeFileUploadProps> = ({
  ticketType,
  onFileSelect,
  disabled = false
}) => {
  const config = getUploadConfig(ticketType);

  if (!ticketType) {
    return (
      <Alert severity="info">
        Please select a ticket type first to upload relevant documents.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {config.title}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {config.description}
      </Typography>
      
      <FileUpload
        onFileSelect={onFileSelect}
        accept={config.accept}
        maxSizeMB={3}
        disabled={disabled}
      />
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Recommended: {config.examples.join(', ')}
        </Typography>
      </Box>
    </Box>
  );
};