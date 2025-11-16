import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Collapse, ToggleButtonGroup, ToggleButton, Card, CardContent, Grid } from '@mui/material';
import { Edit, Delete, Visibility, Folder, Upload, Info, KeyboardArrowDown, KeyboardArrowUp, Download, ViewModule, ViewList, Person } from '@mui/icons-material';
import { userApi, type UserResponseDto, type UserFullDetailsDto } from '../api/api';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';
import { useAuth } from '../contexts/AuthContext';
import UserViewDialog from './UserViewDialog';
import UserEditDialog from './UserEditDialog';
import UserUploadDocumentDialog from './UserUploadDocumentDialog';
import UserDetailsDialog from './UserDetailsDialog';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [fullDetailsUsers, setFullDetailsUsers] = useState<UserFullDetailsDto[]>([]);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');

  const userFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'Admin', label: 'Admin' },
      { value: 'Master Admin', label: 'Master Admin' },
      { value: 'HO User', label: 'HO User' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]},
    { key: 'dateRange', label: 'Created Date', type: 'dateRange' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers(1, 100);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullDetails = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsersWithFullDetails();
      setFullDetailsUsers(data);
      setShowFullDetails(true);
    } catch (err) {
      setError('Failed to fetch full user details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (userId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const downloadCSV = () => {
    const dataToExport = showFullDetails ? fullDetailsUsers : users;
    const headers = ['ID', 'Username', 'Full Name', 'Email', 'Mobile', 'Role', 'Status', 'Created At'];
    if (showFullDetails) {
      headers.push('Address', 'Qualification', 'CSP Code', 'Bank Name', 'PAN', 'Aadhar', 'Documents Count');
    }
    
    const rows = dataToExport.map(user => {
      const baseRow = [
        user.id,
        user.username || '',
        user.fullName || '',
        user.email || '',
        user.mobileNumber || '',
        user.roleName,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ];
      
      if (showFullDetails) {
        const fullUser = user as UserFullDetailsDto;
        const details = fullUser.userDetails as any;
        baseRow.push(
          fullUser.generalDetails?.address || '',
          fullUser.generalDetails?.qualification || '',
          details?.Code || details?.code || '',
          details?.BankName || details?.bankName || '',
          details?.PAN || details?.pan || '',
          details?.AadharNo || details?.aadharNo || '',
          (fullUser.documents?.length || 0).toString()
        );
      }
      
      return baseRow;
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSearch = (searchFilters: FilterValues) => {
    fetchUsers(searchFilters);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (filterValues.search) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.role) {
      filtered = filtered.filter(u => u.roleName === filterValues.role);
    }
    if (filterValues.status) {
      filtered = filtered.filter(u => 
        filterValues.status === 'active' ? u.isActive : !u.isActive
      );
    }
    
    return filtered;
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await userApi.softDeleteUser(selectedUserId);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isMasterAdmin = currentUser?.roleName === 'Master Admin';

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="tile">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant={!showFullDetails ? 'contained' : 'outlined'}
          onClick={() => { setShowFullDetails(false); fetchUsers(); }}
        >
          Basic View
        </Button>
        <Button
          variant={showFullDetails ? 'contained' : 'outlined'}
          onClick={fetchFullDetails}
        >
          Full Details View
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download fontSize="small" />}
          onClick={downloadCSV}
        >
          Download CSV
        </Button>
      </Box>
      
      <DataFilters
        filters={userFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        onSearch={handleSearch}
        searchMode={true}
      />

      {viewMode === 'tile' && !showFullDetails ? (
        <Grid container spacing={2}>
          {getFilteredUsers().map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {user.fullName || user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {user.email || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={user.roleName} size="small" />
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="info" onClick={() => { setSelectedUser(user); setViewDialogOpen(true); }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {showFullDetails && <TableCell />}
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!showFullDetails ? getFilteredUsers().map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Chip label={user.roleName} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'} 
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" color="info" onClick={() => { setSelectedUser(user); setViewDialogOpen(true); }}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : fullDetailsUsers.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleRow(user.id)}>
                      {expandedRows.has(user.id) ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Chip label={user.roleName} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="info" onClick={() => { setSelectedUser(user); setViewDialogOpen(true); }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedRows.has(user.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom>Additional Details</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Mobile:</Typography>
                            <Typography>{user.mobileNumber || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Emergency Contact:</Typography>
                            <Typography>{user.emergencyContactNumber || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Father Name:</Typography>
                            <Typography>{user.fatherName || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Mother Name:</Typography>
                            <Typography>{user.motherName || '-'}</Typography>
                          </Box>
                          {user.generalDetails && (
                            <>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
                                <Typography>{user.generalDetails.address || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">Qualification:</Typography>
                                <Typography>{user.generalDetails.qualification || '-'}</Typography>
                              </Box>
                            </>
                          )}
                          {user.userDetails && (
                            <>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">CSP Code:</Typography>
                                <Typography>{user.userDetails.Code || user.userDetails.code || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">Bank Name:</Typography>
                                <Typography>{user.userDetails.BankName || user.userDetails.bankName || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">Bank Account:</Typography>
                                <Typography>{user.userDetails.BankAccount || user.userDetails.bankAccount || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">IFSC:</Typography>
                                <Typography>{user.userDetails.IFSC || user.userDetails.ifsc || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">PAN:</Typography>
                                <Typography>{user.userDetails.PAN || user.userDetails.pan || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">Aadhar:</Typography>
                                <Typography>{user.userDetails.AadharNo || user.userDetails.aadharNo || '-'}</Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                        {user.documents && user.documents.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Documents ({user.documents.length}):</Typography>
                            {user.documents.map((doc) => (
                              <Chip key={doc.id} label={`${doc.documentType} - ${new Date(doc.uploadedDate).toLocaleDateString()}`} size="small" sx={{ mr: 1, mt: 1 }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        </Paper>
      )}

      <UserViewDialog open={viewDialogOpen} user={selectedUser} onClose={() => setViewDialogOpen(false)} />
      <UserEditDialog open={editDialogOpen} user={selectedUser} onClose={() => setEditDialogOpen(false)} onSave={() => fetchUsers()} />
  {/* UserUploadDocumentDialog and UserDetailsDialog removed; now managed in edit dialog */}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will permanently delete the user, including all user details and documents, from the system. This data cannot be recovered.<br />
            If you need to keep a record, please export the user details and documents before proceeding.
          </Alert>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};