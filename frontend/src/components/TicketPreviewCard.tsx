import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar, Collapse, IconButton, Divider, Grid, Checkbox } from '@mui/material';
import { ExpandMore, Person, Schedule, AttachFile } from '@mui/icons-material';
import { TicketDto } from '../api/api';
import { QuickTicketActions } from './QuickTicketActions';
import { AttachmentGallery } from './AttachmentGallery';
import { InlineTicketEditor } from './InlineTicketEditor';
import { QuickImageViewer } from './QuickImageViewer';

interface TicketPreviewCardProps {
  ticket: TicketDto;
  onUpdate: (updatedTicket: TicketDto) => void;
  onError: (error: string) => void;
  ticketStatuses: Array<{ id: number; name: string }>;
  selected?: boolean;
  onSelectionChange?: (ticketId: string, selected: boolean) => void;
  showSelection?: boolean;
}

export const TicketPreviewCard: React.FC<TicketPreviewCardProps> = ({
  ticket,
  onUpdate,
  onError,
  ticketStatuses,
  selected = false,
  onSelectionChange,
  showSelection = false
}) => {
  const [expanded, setExpanded] = useState(false);

  const getTypeColor = (typeId: number) => {
    switch (typeId) {
      case 1: return '#2196f3'; // Technical - Blue
      case 2: return '#f44336'; // Withdrawal - Red
      case 3: return '#4caf50'; // Deposit - Green
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSpecificDetails = () => {
    if (ticket.typeId === 2 && ticket.withdrawalDetail) {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Amount: <strong>${ticket.withdrawalDetail.amount}</strong> | 
            Method: {ticket.withdrawalDetail.withdrawalMethod} |
            Account: {ticket.withdrawalDetail.account}
          </Typography>
        </Box>
      );
    }
    
    if (ticket.typeId === 3 && ticket.depositDetail) {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Amount: <strong>${ticket.depositDetail.amount}</strong> | 
            Method: Deposit |
            Date: {ticket.depositDetail.depositDate}
          </Typography>
        </Box>
      );
    }
    
    if (ticket.typeId === 1 && ticket.technicalDetail) {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Problem: {ticket.technicalDetail.problemTypeName} |
            AnyDesk: {ticket.technicalDetail.anyDeskDetail || 'N/A'}
          </Typography>
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Card sx={{ mb: 2, border: `2px solid ${getTypeColor(ticket.typeId)}20` }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1 }}>
            {showSelection && (
              <Checkbox
                checked={selected}
                onChange={(e) => onSelectionChange?.(ticket.ticketId, e.target.checked)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
            <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  bgcolor: getTypeColor(ticket.typeId) 
                }}
              />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                #{ticket.ticketId} - {ticket.summary}
              </Typography>
              <Chip 
                label={ticket.typeName} 
                size="small" 
                sx={{ 
                  bgcolor: getTypeColor(ticket.typeId),
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {ticket.description?.substring(0, 100)}{ticket.description && ticket.description.length > 100 ? '...' : ''}
            </Typography>
            
            {renderSpecificDetails()}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="caption">{ticket.createdByUsername}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="caption">{formatDate(ticket.createdDate)}</Typography>
              </Box>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachFile fontSize="small" color="action" />
                    <Typography variant="caption">{ticket.attachments.length}</Typography>
                  </Box>
                  <QuickImageViewer attachments={ticket.attachments} />
                </Box>
              )}
            </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <QuickTicketActions
                ticket={ticket}
                onUpdate={onUpdate}
                onError={onError}
                ticketStatuses={ticketStatuses}
              />
              <InlineTicketEditor
                ticket={ticket}
                onUpdate={onUpdate}
                onError={onError}
                ticketStatuses={ticketStatuses}
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
            >
              <ExpandMore />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
      
      <Collapse in={expanded}>
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>Full Description</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {ticket.description}
              </Typography>
              
              {ticket.comment && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Comments</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {ticket.comment}
                  </Typography>
                </>
              )}
              
              {ticket.resolutionDetail && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Resolution</Typography>
                  <Typography variant="body2">
                    {ticket.resolutionDetail}
                  </Typography>
                </>
              )}
            </Grid>
            
            {ticket.attachments && ticket.attachments.length > 0 && (
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Attachments</Typography>
                <AttachmentGallery 
                  attachments={ticket.attachments}
                  onDownload={(id, name) => {/* Handle download */}}
                  onDelete={(id) => {/* Handle delete */}}
                  showActions={false}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};