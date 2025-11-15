import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Switch, FormControlLabel, Alert } from '@mui/material';
import { Savings, HourglassEmpty, VerifiedUser } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';
import { useLookupData } from '../hooks/useLookupData';
import { TicketPreviewCard } from '../components/TicketPreviewCard';
import { BulkTicketActions } from '../components/BulkTicketActions';

export const DepositTickets: React.FC = () => {
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
      const data = await ticketsApi.getTicketsByType(3, showClosed); // Deposit = 3
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch deposit tickets.');
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
  const verifyingTickets = tickets.filter(t => t.statusId === 2);
  
  const totalPendingAmount = pendingTickets.reduce((sum, t) => 
    sum + (t.depositDetail?.amount || 0), 0
  );
  const totalVerifyingAmount = verifyingTickets.reduce((sum, t) => 
    sum + (t.depositDetail?.amount || 0), 0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Savings color="success" />
          <Typography variant="h4">Deposit Verification Queue</Typography>
          <Chip label={`${pendingTickets.length} Pending`} color="warning" />
          <Chip label={`${verifyingTickets.length} Verifying`} color="info" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
            label="Show Processed"
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
          Verifying Amount: <strong>${totalVerifyingAmount.toLocaleString()}</strong>
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

      <Box sx={{ display: 'grid', gap: 3 }}>
        {pendingTickets.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HourglassEmpty color="warning" /> Awaiting Verification ({pendingTickets.length})
            </Typography>
            {pendingTickets.map(ticket => (
              <TicketPreviewCard
                key={ticket.ticketId}
                ticket={ticket}
                onUpdate={handleTicketUpdate}
                onError={setError}
                ticketStatuses={ticketStatuses}
                selected={selectedTickets.includes(ticket.ticketId)}
                onSelectionChange={handleSelectionChange}
                showSelection={bulkMode}
              />
            ))}
          </Box>
        )}

        {verifyingTickets.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser color="info" /> Under Verification ({verifyingTickets.length})
            </Typography>
            {verifyingTickets.map(ticket => (
              <TicketPreviewCard
                key={ticket.ticketId}
                ticket={ticket}
                onUpdate={handleTicketUpdate}
                onError={setError}
                ticketStatuses={ticketStatuses}
                selected={selectedTickets.includes(ticket.ticketId)}
                onSelectionChange={handleSelectionChange}
                showSelection={bulkMode}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};