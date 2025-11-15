import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Edit, Delete, Visibility, Folder, Upload, Info } from '@mui/icons-material';
import { userApi, type UserResponseDto } from '../api/api';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';
import { useAuth } from '../contexts/AuthContext';
import UserViewDialog from './UserViewDialog';
import UserEditDialog from './UserEditDialog';
import UserUploadDocumentDialog from './UserUploadDocumentDialog';
import UserDetailsDialog from './UserDetailsDialog';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
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
      // In a real implementation, you would pass filters to the API
      // const data = await userApi.getAllUsers(1, 100, filters);
      const data = await userApi.getAllUsers(1, 100);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
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
      {/* Title removed - now handled by parent tabbed component */}
      
      <DataFilters
        filters={userFilters}
        values={filterValues}
        onChange={setFilterValues}
        onClear={() => setFilterValues({})}
        onSearch={handleSearch}
        searchMode={true}
      />

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredUsers().map((user) => (
              <TableRow key={user.id}>
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
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                    <Edit />
                  </IconButton>
                  {/* User document and details actions removed; now managed in edit dialog */}
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

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