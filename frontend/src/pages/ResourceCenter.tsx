import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, TextField, MenuItem, InputAdornment, Fab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search, Add, OpenInNew, Download, Visibility, Star, Folder, Description, VideoLibrary, Link } from '@mui/icons-material';
import { resourceCenterApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  resourceCount: number;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  priority: string;
  isFeatured: boolean;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  category: string;
  uploadedBy: string;
}

export const ResourceCenter: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    resourceType: 'Link',
    externalUrl: '',
    categoryId: '',
    priority: 'Medium',
    isFeatured: false
  });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = useState('resource');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedResources();
    fetchResources();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const data = await resourceCenterApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceCenterApi.getResources(selectedCategory, searchTerm);
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedResources = async () => {
    try {
      const data = await resourceCenterApi.getFeaturedResources();
      setFeaturedResources(data);
    } catch (error) {
      console.error('Failed to fetch featured resources:', error);
    }
  };

  const handleResourceAccess = async (resource: Resource, accessType: 'View' | 'Download') => {
    try {
      await resourceCenterApi.trackAccess(resource.id, accessType);
      
      if (accessType === 'View' && resource.externalUrl) {
        window.open(resource.externalUrl, '_blank');
      }
      
      // Update local counts
      setResources(prev => prev.map(r => 
        r.id === resource.id 
          ? { ...r, [accessType.toLowerCase() + 'Count']: r[accessType.toLowerCase() + 'Count' as keyof Resource] as number + 1 }
          : r
      ));
    } catch (error) {
      console.error('Failed to track access:', error);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Video': return <VideoLibrary />;
      case 'Document': return <Description />;
      case 'File': return <Folder />;
      default: return <Link />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const isAdmin = user?.roleName === 'Admin' || user?.roleName === 'Master Admin';

  const handleCreateResource = async () => {
    try {
      await resourceCenterApi.createResource({
        ...newResource,
        categoryId: parseInt(newResource.categoryId)
      });
      setCreateDialogOpen(false);
      setNewResource({
        title: '',
        description: '',
        resourceType: 'Link',
        externalUrl: '',
        categoryId: '',
        priority: 'Medium',
        isFeatured: false
      });
      fetchResources();
      fetchFeaturedResources();
    } catch (error) {
      console.error('Failed to create resource:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await resourceCenterApi.createCategory(newCategory);
      setCreateDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Resource Center</Typography>
          <Typography variant="body1" color="text.secondary">
            Access training materials, software, and helpful resources
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Manage Resources
          </Button>
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search resources..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star color="warning" />
            Featured Resources
          </Typography>
          <Grid container spacing={2}>
            {featuredResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', border: '2px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getResourceIcon(resource.resourceType)}
                      <Typography variant="h6" noWrap>
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {resource.description}
                    </Typography>
                    <Chip label={resource.category} size="small" />
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<OpenInNew />}
                      onClick={() => handleResourceAccess(resource, 'View')}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Categories */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Categories</Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip
              label="All Categories"
              onClick={() => setSelectedCategory(null)}
              color={selectedCategory === null ? 'primary' : 'default'}
              variant={selectedCategory === null ? 'filled' : 'outlined'}
            />
          </Grid>
          {categories.map((category) => (
            <Grid item key={category.id}>
              <Chip
                label={`${category.name} (${category.resourceCount})`}
                onClick={() => setSelectedCategory(category.id)}
                color={selectedCategory === category.id ? 'primary' : 'default'}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Resources */}
      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getResourceIcon(resource.resourceType)}
                  <Typography variant="h6" noWrap>
                    {resource.title}
                  </Typography>
                  {resource.isFeatured && <Star color="warning" fontSize="small" />}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {resource.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={resource.category} size="small" />
                  <Chip 
                    label={resource.priority} 
                    size="small" 
                    color={getPriorityColor(resource.priority) as any}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" />
                    {resource.viewCount}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Download fontSize="small" />
                    {resource.downloadCount}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  By {resource.uploadedBy} • {new Date(resource.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<OpenInNew />}
                  onClick={() => handleResourceAccess(resource, 'View')}
                >
                  Open
                </Button>
                {resource.fileName && (
                  <Button 
                    size="small" 
                    startIcon={<Download />}
                    onClick={() => handleResourceAccess(resource, 'Download')}
                  >
                    Download
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {resources.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or category filter
          </Typography>
        </Box>
      )}

      {/* Management Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Resources
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Button 
              onClick={() => setActiveTab('resource')} 
              color={activeTab === 'resource' ? 'primary' : 'inherit'}
            >
              Add Resource
            </Button>
            <Button 
              onClick={() => setActiveTab('category')} 
              color={activeTab === 'category' ? 'primary' : 'inherit'}
            >
              Add Category
            </Button>
          </Box>

          {activeTab === 'resource' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  value={newResource.resourceType}
                  onChange={(e) => setNewResource({...newResource, resourceType: e.target.value})}
                >
                  <MenuItem value="Link">External Link</MenuItem>
                  <MenuItem value="Document">Document</MenuItem>
                  <MenuItem value="Video">Video</MenuItem>
                  <MenuItem value="File">File</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={newResource.categoryId}
                  onChange={(e) => setNewResource({...newResource, categoryId: e.target.value})}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="External URL"
                  value={newResource.externalUrl}
                  onChange={(e) => setNewResource({...newResource, externalUrl: e.target.value})}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={newResource.priority}
                  onChange={(e) => setNewResource({...newResource, priority: e.target.value})}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <input
                    type="checkbox"
                    checked={newResource.isFeatured}
                    onChange={(e) => setNewResource({...newResource, isFeatured: e.target.checked})}
                  />
                  <Typography>Featured Resource</Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 'category' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={activeTab === 'resource' ? handleCreateResource : handleCreateCategory}
            variant="contained"
            disabled={activeTab === 'resource' ? !newResource.title : !newCategory.name}
          >
            Create {activeTab === 'resource' ? 'Resource' : 'Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};