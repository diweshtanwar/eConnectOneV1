import React, { useState } from 'react';
import { Box, TextField, Button, Dialog, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { ticketsApi, type TicketDto, type TicketUpdateDto } from '../api/api';

interface InlineTicketEditorProps {
  ticket: TicketDto;
  onUpdate: (updatedTicket: TicketDto) => void;
  onError: (error: string) => void;
  ticketStatuses: Array<{ id: number; name: string }>;
}

export const InlineTicketEditor: React.FC<InlineTicketEditorProps> = ({
  ticket,
  onUpdate,
  onError,
  ticketStatuses
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<TicketUpdateDto>({
    ticketId: ticket.ticketId,
    statusId: ticket.statusId,
    resolutionDetail: ticket.resolutionDetail || '',
    comment: ticket.comment || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await ticketsApi.updateTicket(ticket.ticketId, editData);
      onUpdate(updated);
      setEditOpen(false);
    } catch (err) {
      onError('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const renderTypeSpecificFields = () => {
    if (ticket.typeId === 2 && ticket.withdrawalDetail) {
      return (
        <>
          <TextField
            label="Authorized Amount"
            type="number"
            value={editData.withdrawalDetail?.authorizedAmount || ticket.withdrawalDetail.amount}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              withdrawalDetail: {
                ...prev.withdrawalDetail,
                authorizedAmount: Number(e.target.value)
              }
            }))}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Authorization Status"
            value={editData.withdrawalDetail?.isAuthorized ? 'true' : 'false'}
            onChange={(e) => setEditData(prev => ({
              ...prev,
              withdrawalDetail: {
                ...prev.withdrawalDetail,
                isAuthorized: e.target.value === 'true'
              }
            }))}
            fullWidth
            margin="normal"
          >
            <MenuItem value="true">Authorized</MenuItem>
            <MenuItem value="false">Not Authorized</MenuItem>
          </TextField>
        </>
      );
    }

    if (ticket.typeId === 3 && ticket.depositDetail) {
      return (
        <TextField
          select
          label="Verification Status"
          value={editData.depositDetail?.isVerified ? 'true' : 'false'}
          onChange={(e) => setEditData(prev => ({
            ...prev,
            depositDetail: {
              ...prev.depositDetail,
              isVerified: e.target.value === 'true'
            }
          }))}
          fullWidth
          margin="normal"
        >
          <MenuItem value="true">Verified</MenuItem>
          <MenuItem value="false">Not Verified</MenuItem>
        </TextField>
      );
    }

    return null;
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<Edit />}
        onClick={() => setEditOpen(true)}
        variant="outlined"
      >
        Edit
      </Button>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <TextField
            select
            label="Status"
            value={editData.statusId}
            onChange={(e) => setEditData(prev => ({ ...prev, statusId: Number(e.target.value) }))}
            fullWidth
            margin="normal"
          >
            {ticketStatuses.map(status => (
              <MenuItem key={status.id} value={status.id}>
                {status.name}
              </MenuItem>
            ))}
          </TextField>

          {renderTypeSpecificFields()}

          <TextField
            label="Resolution Details"
            multiline
            rows={3}
            value={editData.resolutionDetail}
            onChange={(e) => setEditData(prev => ({ ...prev, resolutionDetail: e.target.value }))}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Comments"
            multiline
            rows={2}
            value={editData.comment}
            onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} startIcon={<Save />} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};