import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, TextField, Button, MenuItem, Divider, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { ticketsApi, type TicketDto, type TicketUpdateDto, type AttachmentUploadDto, type AttachmentDto, type TicketHistoryDto } from '../api/api';
import { TicketNotificationService } from '../services/ticketNotificationService';
import { useAuth } from '../contexts/AuthContext';
import { useLookupData } from '../hooks/useLookupData';
import { FileUpload } from '../components/FileUpload';
import { AttachmentGallery } from '../components/AttachmentGallery';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTicketData, setUpdatedTicketData] = useState<TicketUpdateDto>({ ticketId: id || '' });
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

  const { ticketStatuses, problemTypes } = useLookupData();

  const fetchTicket = async () => {
    if (!id) {
      setError('Ticket ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await ticketsApi.getTicketById(id);
      setTicket(data);
      setUpdatedTicketData({
        ticketId: data.ticketId,
        summary: data.summary,
        description: data.description,
        statusId: data.statusId,
        completionDate: data.completionDate,
        resolutionDetail: data.resolutionDetail,
        comment: data.comment,
        isDeleted: data.isDeleted,
        technicalDetail: data.technicalDetail ? { ...data.technicalDetail } : undefined,
        withdrawalDetail: data.withdrawalDetail ? { ...data.withdrawalDetail } : undefined,
        depositDetail: data.depositDetail ? { ...data.depositDetail } : undefined,
      });
    } catch (err) {
      setError('Failed to fetch ticket details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setUpdatedTicketData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleDetailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>, detailType: 'technicalDetail' | 'withdrawalDetail' | 'depositDetail') => {
    const { name, value } = e.target;
    setUpdatedTicketData(prev => ({
      ...prev,
      [detailType]: {
        ...prev[detailType],
        [name as string]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const oldStatus = ticket?.statusName || '';
      const result = await ticketsApi.updateTicket(id!, updatedTicketData);
      
      // Send notification if status changed
      if (ticket && updatedTicketData.statusId && updatedTicketData.statusId !== ticket.statusId) {
        const newStatus = ticketStatuses.find(s => s.id === updatedTicketData.statusId)?.name || '';
        await TicketNotificationService.sendStatusUpdateNotification({
          ticketId: ticket.ticketId,
          userId: ticket.raisedByUserId,
          oldStatus,
          newStatus,
          updatedBy: user?.fullName || user?.username || 'System'
        });
      }
      
      setTicket(result);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update ticket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await ticketsApi.addCommentToTicket(id!, newComment);
      setNewComment('');
      // Optimistically update UI instead of re-fetching entire ticket
      if (ticket) {
        const newHistoryItem: TicketHistoryDto = {
          historyId: `temp-${Date.now()}`,
          changeType: 'Comment Added',
          newValue: newComment,
          changedByUserId: user?.id || 0,
          changedByUsername: user?.username || 'Unknown',
          changedDate: new Date().toISOString(),
        };
        setTicket(prev => prev ? {
          ...prev,
          ticketHistory: [...(prev.ticketHistory || []), newHistoryItem]
        } : null);
      }
    } catch (err) {
      setError('Failed to add comment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadAttachment = async () => {
    if (!selectedFile || !id) return;

    setUploading(true);
    setError(null);
    try {
      const uploadDto: AttachmentUploadDto = {
        ticketId: id,
        file: selectedFile,
        fileType: selectedFile.type,
      };
      const newAttachment = await ticketsApi.uploadAttachment(uploadDto);
      setSelectedFile(null);
      // Optimistically update attachments list instead of re-fetching
      if (ticket) {
        setTicket(prev => prev ? {
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        } : null);
      }
    } catch (err) {
      setError('Failed to upload attachment.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachmentClick = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteAttachmentConfirm = async () => {
    if (!attachmentToDelete) return;

    setLoading(true);
    setError(null);
    setDeleteConfirmOpen(false);
    try {
      await ticketsApi.deleteAttachment(attachmentToDelete);
      // Optimistically remove attachment from UI instead of re-fetching
      if (ticket) {
        setTicket(prev => prev ? {
          ...prev,
          attachments: prev.attachments?.filter(att => att.attachmentId !== attachmentToDelete) || []
        } : null);
      }
      setAttachmentToDelete(null);
    } catch (err) {
      setError('Failed to delete attachment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const response = await ticketsApi.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url); // Fix memory leak
    } catch (err) {
      setError('Failed to download attachment.');
      console.error(err);
    }
  };

  if (loading && !ticket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Ticket not found.</Alert>
      </Box>
    );
  }

  const renderSpecificDetails = () => {
    if (ticket.typeId === 1 && ticket.technicalDetail) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Technical Details</Typography>
          <TextField
            label="Problem Type"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.technicalDetail?.problemTypeId || '') : (ticket.technicalDetail.problemTypeName || '')}
            onChange={(e) => handleDetailInputChange(e, 'technicalDetail')}
            name="problemTypeId"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && problemTypes.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Resolution Provided By"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.technicalDetail?.resolutionProvidedByUserId || '') : (ticket.technicalDetail.resolutionProvidedByUsername || '')}
            onChange={(e) => handleDetailInputChange(e, 'technicalDetail')}
            name="resolutionProvidedByUserId"
            disabled={!isEditing}
          />
          <TextField
            label="AnyDesk Detail"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.technicalDetail?.anyDeskDetail || '') : (ticket.technicalDetail.anyDeskDetail || '')}
            onChange={(e) => handleDetailInputChange(e, 'technicalDetail')}
            name="anyDeskDetail"
            disabled={!isEditing}
          />
        </Grid>
      );
    } else if (ticket.typeId === 2 && ticket.withdrawalDetail) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Withdrawal Details</Typography>
          <TextField
            label="Amount"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.amount || '') : (ticket.withdrawalDetail.amount || '')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="amount"
            type="number"
            disabled={!isEditing}
          />
          <TextField
            label="Account"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.account || '') : (ticket.withdrawalDetail.account || '')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="account"
            disabled={!isEditing}
          />
          <TextField
            label="Is Configured"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.isConfigured ? 'Yes' : 'No') : (ticket.withdrawalDetail.isConfigured ? 'Yes' : 'No')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="isConfigured"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && [
              <MenuItem key="yes" value="Yes">Yes</MenuItem>,
              <MenuItem key="no" value="No">No</MenuItem>,
            ]}
          </TextField>
          <TextField
            label="Is Make"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.isMake ? 'Yes' : 'No') : (ticket.withdrawalDetail.isMake ? 'Yes' : 'No')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="isMake"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && [
              <MenuItem key="yes" value="Yes">Yes</MenuItem>,
              <MenuItem key="no" value="No">No</MenuItem>,
            ]}
          </TextField>
          <TextField
            label="Is Authorized"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.isAuthorized ? 'Yes' : 'No') : (ticket.withdrawalDetail.isAuthorized ? 'Yes' : 'No')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="isAuthorized"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && [
              <MenuItem key="yes" value="Yes">Yes</MenuItem>,
              <MenuItem key="no" value="No">No</MenuItem>,
            ]}
          </TextField>
          <TextField
            label="Authorized Amount"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.withdrawalDetail?.authorizedAmount || '') : (ticket.withdrawalDetail.authorizedAmount || '')}
            onChange={(e) => handleDetailInputChange(e, 'withdrawalDetail')}
            name="authorizedAmount"
            type="number"
            disabled={!isEditing}
          />
        </Grid>
      );
    } else if (ticket.typeId === 3 && ticket.depositDetail) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Deposit Details</Typography>
          <TextField
            label="Amount"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.depositDetail?.amount || '') : (ticket.depositDetail.amount || '')}
            onChange={(e) => handleDetailInputChange(e, 'depositDetail')}
            name="amount"
            type="number"
            disabled={!isEditing}
          />
          <TextField
            label="Deposit Date"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={isEditing ? (updatedTicketData.depositDetail?.depositDate ? updatedTicketData.depositDetail.depositDate.split('T')[0] : '') : (ticket.depositDetail.depositDate ? ticket.depositDetail.depositDate.split('T')[0] : '')}
            onChange={(e) => handleDetailInputChange(e, 'depositDetail')}
            name="depositDate"
            disabled={!isEditing}
          />
          <TextField
            label="Has Receipt"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.depositDetail?.hasReceipt ? 'Yes' : 'No') : (ticket.depositDetail.hasReceipt ? 'Yes' : 'No')}
            onChange={(e) => handleDetailInputChange(e, 'depositDetail')}
            name="hasReceipt"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && [
              <MenuItem key="yes" value="Yes">Yes</MenuItem>,
              <MenuItem key="no" value="No">No</MenuItem>,
            ]}
          </TextField>
          <TextField
            label="Receipt Source"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.depositDetail?.receiptSource || '') : (ticket.depositDetail.receiptSource || '')}
            onChange={(e) => handleDetailInputChange(e, 'depositDetail')}
            name="receiptSource"
            disabled={!isEditing}
          />
          <TextField
            label="Is Verified"
            fullWidth
            margin="normal"
            value={isEditing ? (updatedTicketData.depositDetail?.isVerified ? 'Yes' : 'No') : (ticket.depositDetail.isVerified ? 'Yes' : 'No')}
            onChange={(e) => handleDetailInputChange(e, 'depositDetail')}
            name="isVerified"
            select={isEditing}
            disabled={!isEditing}
          >
            {isEditing && [
              <MenuItem key="yes" value="Yes">Yes</MenuItem>,
              <MenuItem key="no" value="No">No</MenuItem>,
            ]}
          </TextField>
        </Grid>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ticket Details
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Ticket ID" fullWidth margin="normal" value={ticket.ticketId} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Ticket Type" fullWidth margin="normal" value={ticket.typeName} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Summary" fullWidth margin="normal" value={isEditing ? updatedTicketData.summary : ticket.summary} onChange={handleInputChange} name="summary" disabled={!isEditing} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Status"
              fullWidth
              margin="normal"
              value={isEditing ? (updatedTicketData.statusId || '') : (ticket.statusName || '')}
              onChange={handleInputChange}
              name="statusId"
              select={isEditing}
              disabled={!isEditing}
            >
              {isEditing && ticketStatuses.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description" fullWidth multiline rows={4} margin="normal" value={isEditing ? updatedTicketData.description : ticket.description} onChange={handleInputChange} name="description" disabled={!isEditing} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Raised By" fullWidth margin="normal" value={ticket.raisedByUsername} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Requested Date" fullWidth margin="normal" value={new Date(ticket.requestedDate).toLocaleDateString()} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Requester Email" fullWidth margin="normal" value={ticket.requesterEmail || 'N/A'} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Requester Mobile" fullWidth margin="normal" value={ticket.requesterMobile || 'N/A'} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Completion Date" fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} value={isEditing ? (updatedTicketData.completionDate ? updatedTicketData.completionDate.split('T')[0] : '') : (ticket.completionDate ? ticket.completionDate.split('T')[0] : '')} onChange={handleInputChange} name="completionDate" disabled={!isEditing} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Resolution Detail" fullWidth multiline rows={3} margin="normal" value={isEditing ? updatedTicketData.resolutionDetail : ticket.resolutionDetail} onChange={handleInputChange} name="resolutionDetail" disabled={!isEditing} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Comments" fullWidth multiline rows={3} margin="normal" value={isEditing ? updatedTicketData.comment : ticket.comment} onChange={handleInputChange} name="comment" disabled={!isEditing} />
          </Grid>

          {renderSpecificDetails()}

          <Grid item xs={12}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleUpdate} disabled={loading} sx={{ mr: 2 }}>
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Edit Ticket
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Add Comment</Typography>
        <TextField
          label="New Comment"
          fullWidth
          multiline
          rows={2}
          margin="normal"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddComment} disabled={loading} sx={{ mt: 1 }}>
          {loading ? <CircularProgress size={24} /> : 'Add Comment'}
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Attachments</Typography>
        <AttachmentGallery
          attachments={ticket.attachments || []}
          onDownload={handleDownloadAttachment}
          onDelete={handleDeleteAttachmentClick}
          canDelete={true}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Upload New Attachment</Typography>
        <FileUpload onFileSelect={handleFileSelect} maxSizeMB={2} disabled={uploading} />
        {selectedFile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
            <Button variant="contained" color="primary" onClick={handleUploadAttachment} disabled={uploading} sx={{ mt: 1 }}>
              {uploading ? <CircularProgress size={24} /> : 'Upload Attachment'}
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Ticket History</Typography>
        <List>
          {ticket.ticketHistory && ticket.ticketHistory.length > 0 ? (
            ticket.ticketHistory.map((historyItem, index) => (
              <ListItem key={historyItem.historyId || index}>
                <ListItemText
                  primary={`${historyItem.changeType} by ${historyItem.changedByUsername} on ${new Date(historyItem.changedDate).toLocaleString()}`}
                  secondary={historyItem.NewValue ? `New Value: ${historyItem.NewValue}` : (historyItem.OldValue ? `Old Value: ${historyItem.OldValue}` : '')}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="No history available." /></ListItem>
          )}
        </List>
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Attachment Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this attachment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAttachmentConfirm} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
