import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { ticketsApi, type TicketCreateDto, type TechnicalDetailCreateDto, type WithdrawalDetailCreateDto, type DepositDetailCreateDto } from '../api/api';
import { TicketTypeFileUpload } from '../components/TicketTypeFileUpload';
import { TicketTypeImagePreview } from '../components/TicketTypeImagePreview';
import { useNavigate } from 'react-router-dom';

interface LookupItem {
  id: number;
  name: string;
}

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [ticketTypes, setTicketTypes] = useState<LookupItem[]>([]);
  const [ticketStatuses, setTicketStatuses] = useState<LookupItem[]>([]);
  const [problemTypes, setProblemTypes] = useState<LookupItem[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterMobile, setRequesterMobile] = useState('');

  // Specific details states
  const [technicalDetail, setTechnicalDetail] = useState<TechnicalDetailCreateDto>({});
  const [withdrawalDetail, setWithdrawalDetail] = useState<WithdrawalDetailCreateDto>({});
  const [depositDetail, setDepositDetail] = useState<DepositDetailCreateDto>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        // Assuming you'll have API endpoints for these lookups
        // For now, using dummy data or assuming they are fetched elsewhere
        // In a real app, you'd fetch these from your backend
        setTicketTypes([
          { id: 1, name: 'Technical' },
          { id: 2, name: 'Withdrawal' },
          { id: 3, name: 'Deposit' },
        ]);
        setTicketStatuses([
          { id: 1, name: 'New' },
          { id: 2, name: 'Pending' },
          { id: 3, name: 'In Progress' },
        ]);
        setProblemTypes([
          { id: 1, name: 'Software Bug' },
          { id: 2, name: 'Hardware Issue' },
          { id: 3, name: 'Network Problem' },
        ]);
      } catch (err) {
        setError('Failed to load lookup data.');
        console.error(err);
      }
    };
    fetchLookupData();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedTypeId) {
      errors.typeId = 'Please select a ticket type';
    }
    if (!summary.trim()) {
      errors.summary = 'Summary is required';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    if (!requesterEmail.trim()) {
      errors.requesterEmail = 'Requester email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
      errors.requesterEmail = 'Please enter a valid email address';
    }
    if (!requesterMobile.trim()) {
      errors.requesterMobile = 'Requester mobile is required';
    } else if (!/^[0-9]{10}$/.test(requesterMobile.replace(/\D/g, ''))) {
      errors.requesterMobile = 'Please enter a valid 10-digit mobile number';
    }
    
    // Type-specific validation
    if (selectedTypeId === 1) {
      // ProblemTypeId is optional
      if (!technicalDetail.anyDeskDetail?.trim()) {
        errors.anyDeskDetail = 'AnyDesk detail is required';
      }
    }
    if (selectedTypeId === 2) {
      if (!withdrawalDetail.amount || withdrawalDetail.amount <= 0) {
        errors.withdrawalAmount = 'Withdrawal amount is required and must be greater than 0';
      }
      if (!withdrawalDetail.account?.trim()) {
        errors.withdrawalAccount = 'Account information is required';
      }
    }
    if (selectedTypeId === 3) {
      if (!depositDetail.amount || depositDetail.amount <= 0) {
        errors.depositAmount = 'Deposit amount is required and must be greater than 0';
      }
      if (!depositDetail.depositDate) {
        errors.depositDate = 'Deposit date is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const newTicket: TicketCreateDto = {
      typeId: selectedTypeId as number,
      summary,
      description,
      requesterEmail,
      requesterMobile,
      statusId: 1, // Default to 'New' status
    };

    if (selectedTypeId === 1) {
      newTicket.technicalDetail = technicalDetail;
    } else if (selectedTypeId === 2) {
      newTicket.withdrawalDetail = withdrawalDetail;
    } else if (selectedTypeId === 3) {
      newTicket.depositDetail = depositDetail;
    }

    try {
      const createdTicket = await ticketsApi.createTicket(newTicket);
      
      // Upload files concurrently if any are selected
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => 
          ticketsApi.uploadAttachment({
            ticketId: createdTicket.ticketId,
            file: file,
            fileType: file.type
          }).catch(uploadErr => {
            console.error('Failed to upload file:', file.name, uploadErr);
            return null; // Continue with other uploads
          })
        );
        await Promise.all(uploadPromises);
      }
      
      setSuccess(`Ticket created successfully! ID: ${createdTicket.ticketId}`);
      // Navigate to the new ticket's detail page
      navigate(`/tickets/${createdTicket.ticketId}`);
    } catch (err: any) {
      console.error('Ticket creation error:', err);
      // Show general error only if no validation errors
      if (Object.keys(validationErrors).length === 0) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create ticket. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificFields = () => {
    switch (selectedTypeId) {
      case 1: // Technical
        return (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Technical Details</Typography>
            <TextField
              select
              label="Problem Type (Optional)"
              fullWidth
              margin="normal"
              value={technicalDetail.problemTypeId || ''}
              onChange={(e) => setTechnicalDetail({ ...technicalDetail, problemTypeId: Number(e.target.value) })}
              error={!!validationErrors.problemType}
              helperText={validationErrors.problemType || 'Select if applicable'}
            >
              {problemTypes.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="AnyDesk Detail"
              fullWidth
              margin="normal"
              value={technicalDetail.anyDeskDetail || ''}
              onChange={(e) => setTechnicalDetail({ ...technicalDetail, anyDeskDetail: e.target.value })}
              error={!!validationErrors.anyDeskDetail}
              helperText={validationErrors.anyDeskDetail}
            />
          </Grid>
        );
      case 2: // Withdrawal
        return (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Withdrawal Details</Typography>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              required
              margin="normal"
              value={withdrawalDetail.amount || ''}
              onChange={(e) => setWithdrawalDetail({ ...withdrawalDetail, amount: Number(e.target.value) })}
              error={!!validationErrors.withdrawalAmount}
              helperText={validationErrors.withdrawalAmount}
            />
            <TextField
              label="Account"
              fullWidth
              margin="normal"
              value={withdrawalDetail.account || ''}
              onChange={(e) => setWithdrawalDetail({ ...withdrawalDetail, account: e.target.value })}
              error={!!validationErrors.withdrawalAccount}
              helperText={validationErrors.withdrawalAccount}
            />
          </Grid>
        );
      case 3: // Deposit
        return (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Deposit Details</Typography>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              required
              margin="normal"
              value={depositDetail.amount || ''}
              onChange={(e) => setDepositDetail({ ...depositDetail, amount: Number(e.target.value) })}
              error={!!validationErrors.depositAmount}
              helperText={validationErrors.depositAmount}
            />
            <TextField
              label="Deposit Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={depositDetail.depositDate ? depositDetail.depositDate.split('T')[0] : ''}
              onChange={(e) => setDepositDetail({ ...depositDetail, depositDate: e.target.value })}
              error={!!validationErrors.depositDate}
              helperText={validationErrors.depositDate}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Ticket
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Ticket Type"
                fullWidth
                required
                margin="normal"
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                error={!!validationErrors.typeId}
                helperText={validationErrors.typeId}
              >
                {ticketTypes.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Summary"
                fullWidth
                required
                margin="normal"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                error={!!validationErrors.summary}
                helperText={validationErrors.summary}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                margin="normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!validationErrors.description}
                helperText={validationErrors.description || 'Provide detailed information about the issue'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Requester Email"
                fullWidth
                margin="normal"
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                error={!!validationErrors.requesterEmail}
                helperText={validationErrors.requesterEmail}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Requester Mobile"
                fullWidth
                margin="normal"
                value={requesterMobile}
                onChange={(e) => setRequesterMobile(e.target.value)}
                error={!!validationErrors.requesterMobile}
                helperText={validationErrors.requesterMobile}
              />
            </Grid>

            {renderSpecificFields()}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Attachments
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TicketTypeFileUpload 
                  ticketType={selectedTypeId as number}
                  onFileSelect={handleFileSelect}
                  disabled={loading}
                />
              </Box>
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <TicketTypeImagePreview
                    files={selectedFiles}
                    onRemove={removeFile}
                    ticketType={selectedTypeId as number}
                  />
                </Box>
              )}
            </Grid>

            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-start' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/tickets')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
