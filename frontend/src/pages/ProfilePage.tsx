import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Button, Chip, IconButton, Paper, LinearProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Fab, MenuItem } from '@mui/material';
import { Edit, Person, Business, Security, Phone, Email, LocationOn, CalendarToday, Badge, Lock, Upload, Download, Delete, Add, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { userApi, type PasswordResetDto } from '../api/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    emergencyContactNumber: user?.emergencyContactNumber || '',
    fatherName: user?.fatherName || '',
    motherName: user?.motherName || ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // Document upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Use local mock state for documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');

  // Mock fetch documents on mount
  useEffect(() => {
    setDocLoading(true);
    setTimeout(() => {
      setDocuments([
        {
          id: '1',
          userId: user?.id,
          userName: user?.fullName,
          documentType: 'Aadhar',
          fileName: 'aadhar_card.pdf',
          fileSize: 1024000,
          uploadedDate: new Date().toISOString(),
          status: 'Pending',
          uploadedBy: user?.username
        },
        {
          id: '2',
          userId: user?.id,
          userName: user?.fullName,
          documentType: 'PAN',
          fileName: 'pan_card.pdf',
          fileSize: 512000,
          uploadedDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'Approved',
          uploadedBy: user?.username
        }
      ]);
      setDocLoading(false);
    }, 500);
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Remove updateMyProfile and just close edit mode for demo
  const handleEditSave = async () => {
    setEditError('');
    setEditSuccess(false);
    setLoading(true);
    try {
      // TODO: Integrate with userApi.updateMyProfile when available
      setIsEditing(false);
      setEditSuccess(true);
    } catch (e) {
      setEditError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Replace upload logic with local mock
  const handleFileUpload = async () => {
    setDocError('');
    setDocSuccess('');
    if (!selectedFile || !documentType) {
      setDocError('Please select a document type and file.');
      return;
    }
    setDocLoading(true);
    setTimeout(() => {
      setDocuments(prev => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          userId: user?.id,
          userName: user?.fullName,
          documentType,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          uploadedDate: new Date().toISOString(),
          status: 'Pending',
          uploadedBy: user?.username
        }
      ]);
      setDocSuccess('Document uploaded successfully.');
      setUploadDialogOpen(false);
      setDocumentType('');
      setDocumentDescription('');
      setSelectedFile(null);
      setDocLoading(false);
    }, 800);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'error';
      case 'ho user': return 'warning';
      case 'master admin': return 'success';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.username[0].toUpperCase();
  };

  const profileCompletion = () => {
    const fields = [user.fullName, user.email, user.mobileNumber, user.fatherName, user.motherName];
    const completed = fields.filter(field => field && field.trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handlePasswordReset = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const passwordResetDto: PasswordResetDto = { newPassword };
      await userApi.resetMyPassword(passwordResetDto);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          User not logged in or profile data not available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: '2rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                {getInitials(user.fullName || user.username)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user.fullName || user.username}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={user.roleName} 
                  color={getRoleColor(user.roleName)}
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                />
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Reset Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
      </Paper>

      {/* Profile Completion */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Profile Completion</Typography>
            <Typography variant="h6" color="primary">{profileCompletion()}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={profileCompletion()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your profile to unlock all features
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information (Editable) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              {isEditing ? (
                <Box>
                  {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
                  {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Mobile Number"
                        name="mobileNumber"
                        value={editForm.mobileNumber}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Emergency Contact"
                        name="emergencyContactNumber"
                        value={editForm.emergencyContactNumber}
                        onChange={handleEditChange}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleEditSave} disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outlined" onClick={() => setIsEditing(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Username</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.username}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Email sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.email || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.mobileNumber || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.emergencyContactNumber || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* User Documents Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Upload color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">My Documents</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" size="small" onClick={() => setUploadDialogOpen(true)}>
                  Upload Document
                </Button>
              </Box>
              {docError && <Alert severity="error" sx={{ mb: 2 }}>{docError}</Alert>}
              {docSuccess && <Alert severity="success" sx={{ mb: 2 }}>{docSuccess}</Alert>}
              <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Uploaded</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No documents found.</TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.documentType}</TableCell>
                          <TableCell>{doc.description || '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<Download />}
                              href={doc.downloadUrl}
                              target="_blank"
                            >
                              Download
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Chip label={doc.status} color={doc.status === 'Approved' ? 'success' : doc.status === 'Rejected' ? 'error' : 'warning'} size="small" />
                          </TableCell>
                          <TableCell>{new Date(doc.uploadedDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Family Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Family Information</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Person sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Father's Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{user.fatherName || 'Not provided'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Person sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Mother's Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{user.motherName || 'Not provided'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Account Information</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Last Login</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Security sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Account Status</Typography>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>



        {/* General Details (if applicable) */}
        {user.generalDetails && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Additional Details</Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Address</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.generalDetails.address || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Business sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Qualification</Typography>
                        <Typography variant="body1" fontWeight="medium">{user.generalDetails.qualification || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Document Type"
            fullWidth
            margin="normal"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <MenuItem value="PAN Card">PAN Card</MenuItem>
            <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
            <MenuItem value="Bank Statement">Bank Statement</MenuItem>
            <MenuItem value="Certificate">Certificate</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          
          <TextField
            label="Description (Optional)"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
          />
          
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" fullWidth>
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleFileUpload} 
            variant="contained" 
            disabled={!selectedFile || !documentType || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {passwordSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset successfully!
            </Alert>
          ) : (
            <>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Confirm Password"
                type="password"
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>Cancel</Button>
          {!passwordSuccess && (
            <Button 
              onClick={handlePasswordReset} 
              variant="contained" 
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};