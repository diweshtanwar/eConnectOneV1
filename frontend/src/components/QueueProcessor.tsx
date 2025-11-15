import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Alert, LinearProgress } from '@mui/material';
import { CheckCircle, Schedule, Error } from '@mui/icons-material';
import { TicketDto } from '../api/api';
import { TicketPreviewCard } from './TicketPreviewCard';

interface QueueProcessorProps {
  tickets: TicketDto[];
  title: string;
  icon: React.ReactNode;
  color: 'warning' | 'info' | 'success' | 'error';
  onUpdate: (updatedTicket: TicketDto) => void;
  onError: (error: string) => void;
  ticketStatuses: Array<{ id: number; name: string }>;
  showSelection?: boolean;
  selectedTickets?: string[];
  onSelectionChange?: (ticketId: string, selected: boolean) => void;
  prioritySort?: boolean;
}

export const QueueProcessor: React.FC<QueueProcessorProps> = ({
  tickets,
  title,
  icon,
  color,
  onUpdate,
  onError,
  ticketStatuses,
  showSelection = false,
  selectedTickets = [],
  onSelectionChange,
  prioritySort = false
}) => {
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    setProcessedCount(0);
  }, [tickets]);

  const handleTicketUpdate = (updatedTicket: TicketDto) => {
    onUpdate(updatedTicket);
    if (updatedTicket.statusId !== tickets.find(t => t.ticketId === updatedTicket.ticketId)?.statusId) {
      setProcessedCount(prev => prev + 1);
    }
  };

  const sortedTickets = prioritySort 
    ? [...tickets].sort((a, b) => {
        // Priority: High amounts first for financial tickets
        if (a.withdrawalDetail && b.withdrawalDetail) {
          return (b.withdrawalDetail.amount || 0) - (a.withdrawalDetail.amount || 0);
        }
        if (a.depositDetail && b.depositDetail) {
          return (b.depositDetail.amount || 0) - (a.depositDetail.amount || 0);
        }
        // Then by creation date (oldest first)
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      })
    : tickets;

  if (tickets.length === 0) return null;

  const progress = processedCount > 0 ? (processedCount / tickets.length) * 100 : 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
        <Chip label={tickets.length} color={color} size="small" />
        {progress > 0 && (
          <Chip 
            label={`${processedCount} processed`} 
            color="success" 
            size="small"
            icon={<CheckCircle />}
          />
        )}
      </Box>

      {progress > 0 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color="success"
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary">
            Processing progress: {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'grid', gap: 2 }}>
        {sortedTickets.map((ticket, index) => (
          <Box key={ticket.ticketId} sx={{ position: 'relative' }}>
            {prioritySort && index < 3 && (
              <Chip
                label={index === 0 ? 'HIGH PRIORITY' : index === 1 ? 'MEDIUM' : 'NORMAL'}
                color={index === 0 ? 'error' : index === 1 ? 'warning' : 'default'}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
              />
            )}
            <TicketPreviewCard
              ticket={ticket}
              onUpdate={handleTicketUpdate}
              onError={onError}
              ticketStatuses={ticketStatuses}
              selected={selectedTickets.includes(ticket.ticketId)}
              onSelectionChange={onSelectionChange}
              showSelection={showSelection}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};