import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, CircularProgress, Alert, Card, CardMedia, Chip } from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { ticketsApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

interface SecureImageViewerProps {
  attachmentId: string;
  fileName: string;
  fileType?: string;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export const SecureImageViewer: React.FC<SecureImageViewerProps> = ({
  attachmentId,
  fileName,
  fileType,
  open,
  onClose,
  onDownload
}) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);

  useEffect(() => {
    if (open && isImage && user) {
      loadSecureImage();
    }
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [open, attachmentId, user]);

  const loadSecureImage = async () => {
    if (!user) {
      setError('Authentication required to view images');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketsApi.downloadAttachment(attachmentId);
      const blob = new Blob([response], { type: fileType });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      setError('Failed to load image. You may not have permission to view this file.');
      console.error('Image load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));

  const handleClose = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    setZoom(1);
    onClose();
  };

  if (!user) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogContent>
          <Alert severity="error">
            Please log in to view attachments
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: 300 }}>
            {fileName}
          </Typography>
          <Chip 
            label={isImage ? 'Image' : 'Document'} 
            size="small" 
            color={isImage ? 'primary' : 'default'}
          />
        </Box>
        <Box>
          {isImage && imageUrl && (
            <>
              <IconButton onClick={handleZoomOut} disabled={zoom <= 0.25}>
                <ZoomOutIcon />
              </IconButton>
              <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomInIcon />
              </IconButton>
            </>
          )}
          {onDownload && (
            <IconButton onClick={onDownload}>
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              Loading secure content...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        )}
        
        {isImage && imageUrl && !loading && (
          <Box 
            sx={{ 
              overflow: 'auto', 
              maxHeight: '100%', 
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img
              src={imageUrl}
              alt={fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease',
                cursor: zoom < 3 ? 'zoom-in' : 'zoom-out'
              }}
              onClick={zoom < 3 ? handleZoomIn : handleZoomOut}
            />
          </Box>
        )}
        
        {!isImage && !loading && !error && (
          <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {fileName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This file type cannot be previewed. Click download to view the file.
            </Typography>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};