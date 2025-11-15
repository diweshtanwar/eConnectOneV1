import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Switch, FormControlLabel } from '@mui/material';
import { Build, BugReport } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';
import { useLookupData } from '../hooks/useLookupData';
import { BulkTicketActions } from '../components/BulkTicketActions';
import { QueueProcessor } from '../components/QueueProcessor';

export const TechnicalTickets: React.FC = () => {
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
      const data = await ticketsApi.getTicketsByType(1, showClosed); // Technical = 1
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch technical tickets.');
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

  const openTickets = tickets.filter(t => t.statusId === 1);
  const inProgressTickets = tickets.filter(t => t.statusId === 2);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Build color="primary" />
          <Typography variant="h4">Technical Support Queue</Typography>
          <Chip label={`${openTickets.length} Open`} color="warning" />
          <Chip label={`${inProgressTickets.length} In Progress`} color="info" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
            label="Show Closed"
          />
          <FormControlLabel
            control={<Switch checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} />}
            label="Bulk Mode"
          />
        </Box>
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
        tickets={openTickets}
        title="New Issues"
        icon={<BugReport color="warning" />}
        color="warning"
        onUpdate={handleTicketUpdate}
        onError={setError}
        ticketStatuses={ticketStatuses}
        showSelection={bulkMode}
        selectedTickets={selectedTickets}
        onSelectionChange={handleSelectionChange}
      />

      <QueueProcessor
        tickets={inProgressTickets}
        title="In Progress"
        icon={<Build color="info" />}
        color="info"
        onUpdate={handleTicketUpdate}
        onError={setError}
        ticketStatuses={ticketStatuses}
        showSelection={bulkMode}
        selectedTickets={selectedTickets}
        onSelectionChange={handleSelectionChange}
      />
    </Box>
  );
};