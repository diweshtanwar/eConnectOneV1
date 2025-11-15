import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControlLabel, Checkbox, Box, Typography, Alert } from '@mui/material';
import { resourceCenterApi } from '../api/api';

interface Category {
  id: number;
  name: string;
}

interface AddResourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddResourceDialog: React.FC<AddResourceDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resource, setResource] = useState({
    title: '',
    description: '',
    resourceType: 'Link',
    externalUrl: '',
    categoryId: '',
    targetRoles: 'All',
    priority: 'Normal',
    isFeatured: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const data = await resourceCenterApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async () => {
    if (!resource.title.trim()) {
      setError('Resource name is required.');
      return;
    }
    
    if (!resource.externalUrl.trim()) {
      setError('Cloud link is required.');
      return;
    }
    
    if (!resource.categoryId) {
      setError('Please select a category.');
      return;
    }

    // Validate URL format
    try {
      new URL(resource.externalUrl);
    } catch {
      setError('Please enter a valid link (must start with http:// or https://)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resourceCenterApi.createResource({
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        externalUrl: resource.externalUrl,
        categoryId: Number(resource.categoryId),
        targetRoles: resource.targetRoles,
        priority: resource.priority,
        isFeatured: resource.isFeatured
      });
      
      setResource({
        title: '',
        description: '',
        resourceType: 'Link',
        externalUrl: '',
        categoryId: '',
        targetRoles: 'All',
        priority: 'Normal',
        isFeatured: false
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Resource</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Resource Name"
          fullWidth
          required
          margin="normal"
          value={resource.title}
          onChange={(e) => setResource({...resource, title: e.target.value})}
          placeholder="e.g., AnyDesk Software, Banking Forms"
        />
        
        <TextField
          label="Short Description"
          fullWidth
          margin="normal"
          value={resource.description}
          onChange={(e) => setResource({...resource, description: e.target.value})}
          placeholder="Brief description (optional)"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            select
            label="Resource Type"
            value={resource.resourceType}
            onChange={(e) => setResource({...resource, resourceType: e.target.value})}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="Link">Link</MenuItem>
            <MenuItem value="Software">Software</MenuItem>
            <MenuItem value="Document">Document</MenuItem>
            <MenuItem value="Video">Video</MenuItem>
            <MenuItem value="Form">Form</MenuItem>
          </TextField>
          
          <TextField
            select
            label="Category"
            required
            value={resource.categoryId}
            onChange={(e) => setResource({...resource, categoryId: e.target.value})}
            sx={{ minWidth: 200 }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <TextField
          label="Cloud Link"
          fullWidth
          required
          margin="normal"
          value={resource.externalUrl}
          onChange={(e) => setResource({...resource, externalUrl: e.target.value})}
          placeholder="https://drive.google.com/file/d/xyz/view?usp=sharing"
          helperText="📁 Google Drive • ☁️ OneDrive • 📦 Dropbox • 🌐 Any public link"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            select
            label="Target Audience"
            value={resource.targetRoles}
            onChange={(e) => setResource({...resource, targetRoles: e.target.value})}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Users</MenuItem>
            <MenuItem value="CSP">CSP Only</MenuItem>
            <MenuItem value="Admin">Admin Only</MenuItem>
            <MenuItem value="HO user">HO Users Only</MenuItem>
          </TextField>
          
          <TextField
            select
            label="Priority"
            value={resource.priority}
            onChange={(e) => setResource({...resource, priority: e.target.value})}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Normal">Normal</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </TextField>
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={resource.isFeatured}
              onChange={(e) => setResource({...resource, isFeatured: e.target.checked})}
            />
          }
          label="Mark as Featured (will appear in featured section)"
          sx={{ mt: 2 }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          💡 <strong>How to get shareable links:</strong><br/>
          • Google Drive: Right-click file → Share → Copy link<br/>
          • OneDrive: Right-click file → Share → Copy link<br/>
          • Dropbox: Right-click file → Share → Copy link
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !resource.title.trim() || !resource.externalUrl.trim() || !resource.categoryId}
        >
          {loading ? 'Adding...' : 'Add Resource'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};