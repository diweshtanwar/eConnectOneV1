import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Switch, Alert, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DataFilters, type FilterOption, type FilterValues } from '../components/DataFilters';
import { systemSettingsApi, type RolePermissionDto } from '../api/api';

export const SystemSettings: React.FC = () => {
  const [permissions, setPermissions] = useState<RolePermissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<{id: number, name: string}[]>([
    { id: 1, name: 'Master Admin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'HO user' },
    { id: 4, name: 'CSP' }
  ]);
  const [newPermission, setNewPermission] = useState({ roleId: '', permission: '', canView: true, canCreate: false, canEdit: false, canDelete: false });

  const settingsFilters: FilterOption[] = [
    { key: 'search', label: 'Search', type: 'text' },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'Master Admin', label: 'Master Admin' },
      { value: 'Admin', label: 'Admin' },
      { value: 'HO user', label: 'HO User' },
  // { value: 'CSP', label: 'CSP' }
    ]},
    { key: 'permission', label: 'Permission', type: 'select', options: [
      { value: 'Dashboard', label: 'Dashboard' },
      { value: 'UserManagement', label: 'User Management' },
      { value: 'TicketManagement', label: 'Ticket Management' },
      { value: 'AuditLogs', label: 'Audit Logs' },
      { value: 'SystemSettings', label: 'System Settings' },
      { value: 'BroadcastManagement', label: 'Broadcast Management' },
      { value: 'CommissionManagement', label: 'Commission Management' },
      { value: 'Messages', label: 'Messages' },
      { value: 'ResourceCenter', label: 'Resource Center' },
      { value: 'WalletManagement', label: 'Wallet Management' }
    ]}
  ];

  const fetchPermissions = async (filters?: FilterValues) => {
    try {
      setLoading(true);
      const [permissionsData, availablePerms] = await Promise.all([
        systemSettingsApi.getRolePermissions(),
        systemSettingsApi.getAvailablePermissions()
      ]);
      
      // Ensure "CreateMain" is always in the list
      const permsWithCreateMain = availablePerms.includes('CreateMain')
        ? availablePerms
        : [...availablePerms, 'CreateMain'];

      setPermissions(permissionsData);
      setAvailablePermissions(permsWithCreateMain);
    } catch (err) {
      setError('Failed to fetch permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: FilterValues) => {
    fetchPermissions(searchFilters);
  };

  const handlePermissionChange = async (id: number, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: boolean) => {
    try {
      const permission = permissions.find(p => p.id === id);
      if (!permission) return;

      const updatedPermission = { ...permission, [field]: value };
      await systemSettingsApi.updateRolePermission(id, updatedPermission);
      
      setPermissions(prev => prev.map(p => p.id === id ? updatedPermission : p));
    } catch (err) {
      setError('Failed to update permission.');
    }
  };

  const getFilteredPermissions = () => {
    let filtered = permissions;
    
    if (filterValues.search) {
      filtered = filtered.filter(p => 
        p.roleName.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        p.permission.toLowerCase().includes(filterValues.search.toLowerCase())
      );
    }
    if (filterValues.role) {
      filtered = filtered.filter(p => p.roleName === filterValues.role);
    }
    if (filterValues.permission) {
      filtered = filtered.filter(p => p.permission === filterValues.permission);
    }
    
    return filtered;
  };

  const handleCreatePermission = async () => {
    try {
      if (!newPermission.roleId || !newPermission.permission) {
        setError('Please select role and permission.');
        return;
      }
      
      const permissionData = {
        roleId: Number(newPermission.roleId),
        permission: newPermission.permission,
        canView: newPermission.canView,
        canCreate: newPermission.canCreate,
        canEdit: newPermission.canEdit,
        canDelete: newPermission.canDelete
      };
      
      await systemSettingsApi.createRolePermission(permissionData);
      setSuccess('Permission created successfully!');
      setCreateDialogOpen(false);
      setNewPermission({ roleId: '', permission: '', canView: true, canCreate: false, canEdit: false, canDelete: false });
      fetchPermissions();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create permission.');
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    
    try {
      await systemSettingsApi.deleteRolePermission(id);
      setSuccess('Permission deleted successfully!');
      fetchPermissions();
    } catch (err) {
      setError('Failed to delete permission.');
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>System Settings</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure role-based permissions for different features
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Role Permissions</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Permission
        </Button>
      </Box>
      
      <DataFilters
        filters={settingsFilters}
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
              <TableCell>Role</TableCell>
              <TableCell>Permission</TableCell>
              <TableCell align="center">View</TableCell>
              <TableCell align="center">Create</TableCell>
              <TableCell align="center">Edit</TableCell>
              <TableCell align="center">Delete</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredPermissions().map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.roleName}</TableCell>
                <TableCell>{permission.permission}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={permission.canView}
                    onChange={(e) => handlePermissionChange(permission.id, 'canView', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={permission.canCreate}
                    onChange={(e) => handlePermissionChange(permission.id, 'canCreate', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={permission.canEdit}
                    onChange={(e) => handlePermissionChange(permission.id, 'canEdit', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={permission.canDelete}
                    onChange={(e) => handlePermissionChange(permission.id, 'canDelete', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeletePermission(permission.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      
      {/* Create Permission Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Permission</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Role"
            fullWidth
            margin="normal"
            value={newPermission.roleId}
            onChange={(e) => setNewPermission({...newPermission, roleId: e.target.value})}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Permission"
            fullWidth
            margin="normal"
            value={newPermission.permission}
            onChange={(e) => setNewPermission({...newPermission, permission: e.target.value})}
          >
            {availablePermissions.map((perm) => (
              <MenuItem key={perm} value={perm}>
                {perm}
              </MenuItem>
            ))}
          </TextField>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Permissions:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <label>
                <Switch
                  checked={newPermission.canView}
                  onChange={(e) => setNewPermission({...newPermission, canView: e.target.checked})}
                  size="small"
                />
                View
              </label>
              <label>
                <Switch
                  checked={newPermission.canCreate}
                  onChange={(e) => setNewPermission({...newPermission, canCreate: e.target.checked})}
                  size="small"
                />
                Create
              </label>
              <label>
                <Switch
                  checked={newPermission.canEdit}
                  onChange={(e) => setNewPermission({...newPermission, canEdit: e.target.checked})}
                  size="small"
                />
                Edit
              </label>
              <label>
                <Switch
                  checked={newPermission.canDelete}
                  onChange={(e) => setNewPermission({...newPermission, canDelete: e.target.checked})}
                  size="small"
                />
                Delete
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePermission} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};