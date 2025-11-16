import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Search, OpenInNew, Download, Visibility, Star, Folder, Description, VideoLibrary, Link, ViewModule, ViewList } from '@mui/icons-material';
import { resourceCenterApi } from '../api/api';

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

export const MyResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');

  useEffect(() => {
    fetchFeaturedResources();
    fetchResources();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [searchTerm]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceCenterApi.getResources(null, searchTerm);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>My Resources</Typography>
        <Typography variant="body1" color="text.secondary">
          Access training materials, documents, and helpful resources
        </Typography>
      </Box>

      {/* Search and View Toggle */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
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
          sx={{ flexGrow: 1 }}
        />
      </Box>

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
        </Box>
      )}

      {/* Resources */}
      {viewMode === 'tile' ? (
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getResourceIcon(resource.resourceType)}
                      {resource.title}
                      {resource.isFeatured && <Star color="warning" fontSize="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>{resource.resourceType}</TableCell>
                  <TableCell><Chip label={resource.category} size="small" /></TableCell>
                  <TableCell>
                    <Chip label={resource.priority} size="small" color={getPriorityColor(resource.priority) as any} />
                  </TableCell>
                  <TableCell>{resource.viewCount}</TableCell>
                  <TableCell>{resource.downloadCount}</TableCell>
                  <TableCell>{new Date(resource.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {resources.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search
          </Typography>
        </Box>
      )}
    </Box>
  );
};
