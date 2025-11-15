import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Paper, Alert } from '@mui/material';
import { Add, Edit, Delete, Visibility, OpenInNew } from '@mui/icons-material';
import { resourceCenterApi } from '../api/api';
import { AddResourceDialog } from '../components/AddResourceDialog';

interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  externalUrl?: string;
  priority: string;
  isFeatured: boolean;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  category: string;
  uploadedBy: string;
}

export const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceCenterApi.getResources();
      setResources(data);
    } catch (err) {
      setError('Failed to fetch resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setSuccess('Resource added successfully!');
    fetchResources();
    setTimeout(() => setSuccess(null), 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Software': return 'primary';
      case 'Video': return 'secondary';
      case 'Document': return 'success';
      case 'Form': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Resource Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage resources and external links for users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Resource
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{resource.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                      {resource.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={resource.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={resource.resourceType} 
                    size="small" 
                    color={getTypeColor(resource.resourceType) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={resource.priority} 
                    size="small" 
                    color={getPriorityColor(resource.priority) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">All Users</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<Visibility />} 
                      label={resource.viewCount} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {resource.isFeatured && (
                    <Chip label="Featured" size="small" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {resource.externalUrl && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => window.open(resource.externalUrl, '_blank')}
                        title="Open Link"
                      >
                        <OpenInNew />
                      </IconButton>
                    )}
                    <IconButton size="small" color="info" title="Edit">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" title="Delete">
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {resources.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No resources found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding your first resource
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Resource
            </Button>
          </Box>
        )}
      </Paper>

      <AddResourceDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
};