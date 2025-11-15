import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Switch, FormControlLabel, Alert } from '@mui/material';
import { AccountBalance, PendingActions, CheckCircle } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';
import { useLookupData } from '../hooks/useLookupData';
import { BulkTicketActions } from '../components/BulkTicketActions';
import { QueueProcessor } from '../components/QueueProcessor';

export const WithdrawalTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const { ticketStatuses } = useLookupData();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getTicketsByType(2, showClosed); // Withdrawal = 2
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch withdrawal tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [showClosed]);

  const handleTicketUpdate = (updatedTicket: TicketDto) => {
    setTickets(prev => prev.map(ticket => 
      ticket.ticketId === updatedTicket.ticketId ? updatedTicket : ticket
    ));
  };

  const handleBulkUpdate = (updatedTickets: TicketDto[]) => {
    setTickets(prev => {
      const updatedMap = new Map(updatedTickets.map(t => [t.ticketId, t]));
      return prev.map(ticket => updatedMap.get(ticket.ticketId) || ticket);
    });
  };

  const handleSelectionChange = (ticketId: string, selected: boolean) => {
    setSelectedTickets(prev => 
      selected ? [...prev, ticketId] : prev.filter(id => id !== ticketId)
    );
  };

  const pendingTickets = tickets.filter(t => t.statusId === 1);
  const processingTickets = tickets.filter(t => t.statusId === 2);
  
  const totalPendingAmount = pendingTickets.reduce((sum, t) => 
    sum + (t.withdrawalDetail?.amount || 0), 0
  );
  const totalProcessingAmount = processingTickets.reduce((sum, t) => 
    sum + (t.withdrawalDetail?.amount || 0), 0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalance color="error" />
          <Typography variant="h4">Withdrawal Processing Queue</Typography>
          <Chip label={`${pendingTickets.length} Pending`} color="warning" />
          <Chip label={`${processingTickets.length} Processing`} color="info" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
            label="Show Completed"
          />
          <FormControlLabel
            control={<Switch checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} />}
            label="Bulk Mode"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Alert severity="warning" sx={{ flex: 1 }}>
          Pending Amount: <strong>${totalPendingAmount.toLocaleString()}</strong>
        </Alert>
        <Alert severity="info" sx={{ flex: 1 }}>
          Processing Amount: <strong>${totalProcessingAmount.toLocaleString()}</strong>
        </Alert>
      </Box>

      {bulkMode && (
        <BulkTicketActions
          tickets={tickets}
          selectedTickets={selectedTickets}
          onSelectionChange={setSelectedTickets}
          onBulkUpdate={handleBulkUpdate}
          onError={setError}
          ticketStatuses={ticketStatuses}
        />
      )}

      <QueueProcessor
        tickets={pendingTickets}
        title="Pending Verification"
        icon={<PendingActions color="warning" />}
        color="warning"
        onUpdate={handleTicketUpdate}
        onError={setError}
        ticketStatuses={ticketStatuses}
        showSelection={bulkMode}
        selectedTickets={selectedTickets}
        onSelectionChange={handleSelectionChange}
        prioritySort={true}
      />

      <QueueProcessor
        tickets={processingTickets}
        title="Processing"
        icon={<CheckCircle color="info" />}
        color="info"
        onUpdate={handleTicketUpdate}
        onError={setError}
        ticketStatuses={ticketStatuses}
        showSelection={bulkMode}
        selectedTickets={selectedTickets}
        onSelectionChange={handleSelectionChange}
        prioritySort={true}
      />
    </Box>
  );
};