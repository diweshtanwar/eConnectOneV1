import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, ToggleButton, ToggleButtonGroup, Tabs, Tab } from '@mui/material';
import { ticketsApi, type TicketDto } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useLookupData } from '../hooks/useLookupData';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';

export const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const { ticketStatuses } = useLookupData();
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [activeTab, setActiveTab] = useState(0);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const allTickets = await ticketsApi.getAllTickets();
        const myTickets = allTickets.filter(t => t.raisedByUserId === user.id);
        setTickets(myTickets);
      } catch (err) {
        setError('Failed to fetch your tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  const ticketFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ticketStatuses.map(s => ({ value: s.id, label: s.name })) },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 1, label: 'Technical' },
      { value: 2, label: 'Withdrawal' },
      { value: 3, label: 'Deposit' }
    ]},
    { key: 'dateRange', label: 'Created Date', type: 'dateRange' },
  ];

  const getFilteredTickets = () => {
    let filtered = tickets;
    // Tabs
    switch (activeTab) {
      case 1: filtered = filtered.filter(t => t.statusId === 1); break;
      case 2: filtered = filtered.filter(t => t.statusId === 2); break;
      case 3: filtered = filtered.filter(t => t.typeId === 1); break;
      case 4: filtered = filtered.filter(t => t.typeId === 2); break;
      case 5: filtered = filtered.filter(t => t.typeId === 3); break;
    }
    // Filters
    if (filterValues.search) {
      filtered = filtered.filter(t =>
        t.summary?.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        t.description?.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.status) {
      filtered = filtered.filter(t => t.statusId === filterValues.status);
    }
    if (filterValues.type) {
      filtered = filtered.filter(t => t.typeId === filterValues.type);
    }
    // Date range filter (if implemented)
    // ...
    return filtered;
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'warning';
      case 2: return 'info';
      case 3: return 'success';
      case 4: return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Tickets</Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="table">Table</ToggleButton>
          <ToggleButton value="cards">Cards</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <DataFilters
        filters={ticketFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        searchMode={true}
      />
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${tickets.length})`} />
        <Tab label={`Open (${tickets.filter(t => t.statusId === 1).length})`} />
        <Tab label={`In Progress (${tickets.filter(t => t.statusId === 2).length})`} />
        <Tab label={`Technical (${tickets.filter(t => t.typeId === 1).length})`} />
        <Tab label={`Withdrawals (${tickets.filter(t => t.typeId === 2).length})`} />
        <Tab label={`Deposits (${tickets.filter(t => t.typeId === 3).length})`} />
      </Tabs>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : getFilteredTickets().length === 0 ? (
        <Typography>No tickets found for your account.</Typography>
      ) : viewMode === 'table' ? (
        <Paper elevation={3} sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTickets().map(ticket => (
                  <TableRow key={ticket.ticketId}>
                    <TableCell>{ticket.ticketId}</TableCell>
                    <TableCell>{ticket.summary}</TableCell>
                    <TableCell><Chip label={ticket.typeName} size="small" /></TableCell>
                    <TableCell><Chip label={ticket.statusName} color={getStatusColor(ticket.statusId)} size="small" /></TableCell>
                    <TableCell>{new Date(ticket.createdDate || ticket.requestedDate).toLocaleString()}</TableCell>
                    <TableCell>{ticket.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box>
          {/* Card view can be implemented here if needed */}
          {getFilteredTickets().map(ticket => (
            <Paper key={ticket.ticketId} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1">{ticket.summary}</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <Chip label={ticket.typeName} size="small" />
                <Chip label={ticket.statusName} color={getStatusColor(ticket.statusId)} size="small" />
                <Typography variant="caption">{new Date(ticket.createdDate || ticket.requestedDate).toLocaleString()}</Typography>
              </Box>
              <Typography variant="body2">{ticket.description}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};
