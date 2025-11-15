import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, ToggleButton, ToggleButtonGroup, Tabs, Tab, Chip, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid } from '@mui/material';
import { ViewList, ViewModule, Add as AddIcon, SelectAll } from '@mui/icons-material';
import { ticketsApi, type TicketDto } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useLookupData } from '../hooks/useLookupData';
import { TicketPreviewCard } from '../components/TicketPreviewCard';
import { BulkTicketActions } from '../components/BulkTicketActions';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';
import { DuplicateHighlight } from '../components/DuplicateHighlight';
import { RefreshButton } from '../components/RefreshButton';
import { AmountApprovalDialog } from '../components/AmountApprovalDialog';
import { BulkApprovalDialog } from '../components/BulkApprovalDialog';
import { QuickActions } from '../components/QuickActions';
import { walletApi } from '../api/api';
import { calculateTicketPriority, sortTicketsByPriority } from '../utils/ticketPriority';
import { notificationService } from '../services/notificationService';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { HelpDialog } from '../components/HelpDialog';
import { RiskAlerts } from '../components/RiskAlerts';
import { useAuth } from '../contexts/AuthContext';

export const TicketManagement: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const isAdmin = user?.roleName === 'Master Admin' || user?.roleName === 'Admin';
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    ticket?: TicketDto;
  }>({ open: false });
  const [bulkApprovalDialog, setBulkApprovalDialog] = useState(false);
  const [helpDialog, setHelpDialog] = useState(false);
  const [lastTicketCount, setLastTicketCount] = useState(0);

  const navigate = useNavigate();
  const { ticketStatuses } = useLookupData();

  const ticketFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ticketStatuses.map(s => ({ value: s.id, label: s.name })) },
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 1, label: 'Technical' },
      { value: 2, label: 'Withdrawal' },
      { value: 3, label: 'Deposit' }
    ]},
    { key: 'dateRange', label: 'Created Date', type: 'dateRange' },
    { key: 'assignedTo', label: 'Assigned To', type: 'text' }
  ];

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
      selected 
        ? [...prev, ticketId]
        : prev.filter(id => id !== ticketId)
    );
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const getFilteredTickets = () => {
    let filtered = tickets;
    
    // Apply tab filter
    switch (activeTab) {
      case 1: filtered = filtered.filter(t => t.statusId === 1); break;
      case 2: filtered = filtered.filter(t => t.statusId === 2); break;
      case 3: filtered = filtered.filter(t => t.typeId === 1); break;
      case 4: filtered = filtered.filter(t => t.typeId === 2); break;
      case 5: filtered = filtered.filter(t => t.typeId === 3); break;
    }
    
    // Apply additional filters
    if (filterValues.search) {
      filtered = filtered.filter(t => 
        t.summary.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        t.description?.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.status) {
      filtered = filtered.filter(t => t.statusId === filterValues.status);
    }
    if (filterValues.type) {
      filtered = filtered.filter(t => t.typeId === filterValues.type);
    }
    if (filterValues.assignedTo) {
      filtered = filtered.filter(t => 
        t.raisedByUsername?.toLowerCase().includes(filterValues.assignedTo.toLowerCase())
      );
    }
    
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

  const fetchTickets = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const data = await ticketsApi.getAllTickets();
      console.log('Fetched tickets:', data);
      // Add priority calculation and sort
      const ticketsWithPriority = data.map(ticket => {
        const amount = ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0;
        const createdHours = Math.floor((Date.now() - new Date(ticket.createdDate).getTime()) / (1000 * 60 * 60));
        const priority = calculateTicketPriority(
          amount,
          ticket.typeId === 2 ? 'withdrawal' : 'deposit',
          'CSP',
          createdHours
        );
        return { ...ticket, priority };
      });
      const sortedTickets = sortTicketsByPriority(ticketsWithPriority);
      setTickets(sortedTickets);
      // Show notifications for new urgent tickets
      const newTickets = sortedTickets.filter(t => 
        t.statusId === 1 && 
        t.priority?.level === 'URGENT' &&
        (!lastTicketCount || sortedTickets.length > lastTicketCount)
      );
      if (newTickets.length > 0 && lastTicketCount > 0) {
        newTickets.forEach(ticket => {
          const amount = ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0;
          notificationService.showTicketNotification({
            ticketId: ticket.ticketId,
            summary: ticket.summary,
            amount,
            ticketType: ticket.typeId === 2 ? 'withdrawal' : 'deposit',
            priority: ticket.priority?.level || 'MEDIUM'
          });
        });
      }
      setLastTicketCount(sortedTickets.length);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessTicket = (ticket: TicketDto) => {
    setApprovalDialog({ open: true, ticket });
  };

  const handleApproval = async (approvedAmount: number, comment: string) => {
    if (!approvalDialog.ticket) return;
    
    const ticket = approvalDialog.ticket;
    const requestedAmount = ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0;
    
    try {
      if (ticket.typeId === 2) { // Withdrawal
        const result = await walletApi.processWithdrawal(
          ticket.ticketId,
          ticket.raisedByUserId,
          requestedAmount,
          approvedAmount,
          comment
        );
        
        if (result.isNegative) {
          setProcessingMessage(`⚠️ Withdrawal processed with negative balance: ₹${result.newBalance.toLocaleString()}`);
          setTimeout(() => setProcessingMessage(''), 5000);
        }
      } else { // Deposit
        await walletApi.processDeposit(
          ticket.ticketId,
          ticket.raisedByUserId,
          requestedAmount,
          approvedAmount,
          comment
        );
      }
      
      await ticketsApi.updateTicketStatus(ticket.ticketId, 3); // Completed
      await ticketsApi.addCommentToTicket(
        ticket.ticketId, 
        `Approved: ₹${approvedAmount.toLocaleString()} (Requested: ₹${requestedAmount.toLocaleString()}). ${comment}`
      );
      
      setApprovalDialog({ open: false });
      fetchTickets();
    } catch (error) {
      setError('Failed to process approval');
    }
  };

  const handleRejection = async (comment: string) => {
    if (!approvalDialog.ticket) return;
    
    try {
      await ticketsApi.updateTicketStatus(approvalDialog.ticket.ticketId, 4); // Rejected
      await ticketsApi.addCommentToTicket(
        approvalDialog.ticket.ticketId, 
        `Rejected: ${comment}`
      );
      
      setApprovalDialog({ open: false });
      fetchTickets();
    } catch (error) {
      setError('Failed to reject ticket');
    }
  };

  const handleQuickApprove = async (ticketId: string) => {
    const ticket = tickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;
    
    const amount = ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0;
    await handleApproval(amount, 'Quick approval for small amount');
  };

  const handleQuickReject = async (ticketId: string) => {
    await handleRejection('Quick rejection');
  };

  const handleBulkApproval = async (approvalType: 'full' | 'percentage' | 'fixed', value: number, comment: string) => {
    try {
      const ticketIds = selectedTickets;
      await walletApi.bulkApprove(ticketIds, approvalType, value, comment);
      
      setBulkApprovalDialog(false);
      setSelectedTickets([]);
      fetchTickets();
    } catch (error) {
      setError('Failed to process bulk approval');
    }
  };





  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: () => fetchTickets(),
    onBulkMode: () => setBulkMode(!bulkMode),
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    }
  });

  const handleSearch = (searchFilters: FilterValues) => {
    fetchTickets(searchFilters);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Smart Ticket Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <RefreshButton onRefresh={() => fetchTickets()} />
          {bulkMode && selectedTickets.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => setBulkApprovalDialog(true)}
            >
              Bulk Approve ({selectedTickets.length})
            </Button>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={bulkMode}
                onChange={(e) => {
                  setBulkMode(e.target.checked);
                  if (!e.target.checked) setSelectedTickets([]);
                }}
                size="small"
              />
            }
            label="Bulk Mode"
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="cards">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="table">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-ticket')}
          >
            Create Ticket
          </Button>
          <Button
            variant="outlined"
            onClick={() => setHelpDialog(true)}
            size="small"
          >
            Help (Shortcuts)
          </Button>
        </Box>
      </Box>

      {/* Risk Alerts */}
      <RiskAlerts />

      {/* Processing Message */}
      {processingMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {processingMessage}
        </Alert>
      )}

      {/* Duplicate Amount Warnings - Top of Page */}
      <Box sx={{ mb: 2 }}>
        {getFilteredTickets()
          .filter(t => (t.typeId === 2 || t.typeId === 3) && (t.withdrawalDetail?.amount || t.depositDetail?.amount))
          .map(ticket => (
            <DuplicateHighlight
              key={ticket.ticketId}
              ticketId={ticket.ticketId}
              amount={ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount}
              ticketType={ticket.typeId === 2 ? 'withdrawal' : 'deposit'}
            />
          ))
        }
      </Box>

      <DataFilters
        filters={ticketFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        onSearch={handleSearch}
        searchMode={true}
      />
      
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label={`All (${tickets.length})`} />
        <Tab label={`Open (${tickets.filter(t => t.statusId === 1).length})`} />
        <Tab label={`In Progress (${tickets.filter(t => t.statusId === 2).length})`} />
        <Tab label={`Technical (${tickets.filter(t => t.typeId === 1).length})`} />
        <Tab label={`Withdrawals (${tickets.filter(t => t.typeId === 2).length})`} />
        <Tab label={`Deposits (${tickets.filter(t => t.typeId === 3).length})`} />
      </Tabs>
      {bulkMode && (
        <BulkTicketActions
          tickets={getFilteredTickets()}
          selectedTickets={selectedTickets}
          onSelectionChange={setSelectedTickets}
          onBulkUpdate={handleBulkUpdate}
          onError={handleError}
          ticketStatuses={ticketStatuses}
        />
      )}

      {getFilteredTickets().length === 0 ? (
        <Typography>No tickets found.</Typography>
      ) : viewMode === 'cards' ? (
        <Box>
          {getFilteredTickets().map((ticket) => (
            <TicketPreviewCard
              key={ticket.ticketId}
              ticket={ticket}
              onUpdate={handleTicketUpdate}
              onError={handleError}
              ticketStatuses={ticketStatuses}
              selected={selectedTickets.includes(ticket.ticketId)}
              onSelectionChange={handleSelectionChange}
              showSelection={bulkMode}
            />
          ))}
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTickets().map((ticket) => (
                  <TableRow key={ticket.ticketId}>
                    <TableCell>{ticket.ticketId}</TableCell>
                    <TableCell>{ticket.summary}</TableCell>
                    <TableCell>
                      <Chip label={ticket.typeName} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.statusName} 
                        color={getStatusColor(ticket.statusId)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{ticket.createdByUsername || ticket.raisedByUsername}</TableCell>
                    <TableCell>{new Date(ticket.createdDate || ticket.requestedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {ticket.priority && (
                          <Chip 
                            label={ticket.priority.level} 
                            color={ticket.priority.color} 
                            size="small"
                          />
                        )}
                        <Button size="small" onClick={() => navigate(`/tickets/${ticket.ticketId}`)}>
                          View
                        </Button>
                        {(ticket.typeId === 2 || ticket.typeId === 3) && ticket.statusId === 1 && (
                          <QuickActions
                            ticket={ticket}
                            onQuickApprove={handleQuickApprove}
                            onQuickReject={handleQuickReject}
                            onCustomApprove={() => handleProcessTicket(ticket)}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Amount Approval Dialog */}
      {approvalDialog.ticket && (
        <AmountApprovalDialog
          open={approvalDialog.open}
          onClose={() => setApprovalDialog({ open: false })}
          onApprove={handleApproval}
          onReject={handleRejection}
          ticket={{
            ticketId: approvalDialog.ticket.ticketId,
            summary: approvalDialog.ticket.summary,
            requestedAmount: approvalDialog.ticket.withdrawalDetail?.amount || approvalDialog.ticket.depositDetail?.amount || 0,
            ticketType: approvalDialog.ticket.typeId === 2 ? 'withdrawal' : 'deposit',
            requesterName: approvalDialog.ticket.raisedByUsername || 'Unknown',
            raisedByUserId: approvalDialog.ticket.raisedByUserId
          }}
        />
      )}

      {/* Bulk Approval Dialog */}
      <BulkApprovalDialog
        open={bulkApprovalDialog}
        onClose={() => setBulkApprovalDialog(false)}
        onApprove={handleBulkApproval}
        tickets={selectedTickets.map(id => {
          const ticket = tickets.find(t => t.ticketId === id)!;
          return {
            ticketId: ticket.ticketId,
            summary: ticket.summary,
            requestedAmount: ticket.withdrawalDetail?.amount || ticket.depositDetail?.amount || 0,
            ticketType: ticket.typeId === 2 ? 'withdrawal' : 'deposit'
          };
        })}
      />

      {/* Help Dialog */}
      <HelpDialog
        open={helpDialog}
        onClose={() => setHelpDialog(false)}
      />


    </Box>
  );
};
