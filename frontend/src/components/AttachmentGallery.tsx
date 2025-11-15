import React, { useState } from 'react';
import { Box, Card, CardMedia, Typography, IconButton, Grid, Chip } from '@mui/material';
import { Visibility as ViewIcon, Download as DownloadIcon, Delete as DeleteIcon, Description as DocIcon } from '@mui/icons-material';
import { AttachmentDto } from '../api/api';
import { SecureImageViewer } from './SecureImageViewer';

interface AttachmentGalleryProps {
  attachments: AttachmentDto[];
  onView?: (attachmentId: string, fileName: string, fileType?: string) => void;
  onDownload?: (attachmentId: string, fileName: string) => void;
  onDelete?: (attachmentId: string) => void;
  canDelete?: boolean;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({
  attachments,
  onView,
  onDownload,
  onDelete,
  canDelete = false
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentDto | null>(null);

  const isImage = (fileName: string, fileType?: string) => {
    return fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📃';
      case 'log': return '📋';
      default: return '📎';
    }
  };

  const handleView = (attachment: AttachmentDto) => {
    setSelectedAttachment(attachment);
    setViewerOpen(true);
    onView?.(attachment.attachmentId, attachment.fileName, attachment.fileType);
  };

  const handleDownload = (attachment: AttachmentDto) => {
    onDownload?.(attachment.attachmentId, attachment.fileName);
  };

  const handleDelete = (attachment: AttachmentDto) => {
    onDelete?.(attachment.attachmentId);
  };

  if (!attachments || attachments.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
        No attachments
      </Typography>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {attachments.map((attachment) => (
          <Grid item xs={12} sm={6} md={4} key={attachment.attachmentId}>
            <Card sx={{ position: 'relative', height: 200 }}>
              {isImage(attachment.fileName, attachment.fileType) ? (
                <Box sx={{ position: 'relative', height: 140, bgcolor: 'grey.100' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleView(attachment)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <ViewIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="caption" display="block">
                        Click to view
                      </Typography>
                    </Box>
                  </CardMedia>
                  <Chip 
                    label="Image" 
                    size="small" 
                    color="primary" 
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  height: 140, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  cursor: 'pointer'
                }}
                onClick={() => handleView(attachment)}
                >
                  <Typography sx={{ fontSize: 40, mb: 1 }}>
                    {getFileIcon(attachment.fileName)}
                  </Typography>
                  <DocIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
                </Box>
              )}
              
              <Box sx={{ p: 1, height: 60 }}>
                <Typography variant="body2" noWrap title={attachment.fileName}>
                  {attachment.fileName}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  By {attachment.uploadedByUsername}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(attachment.uploadedDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                gap: 0.5,
                bgcolor: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                p: 0.5
              }}>
                <IconButton size="small" onClick={() => handleView(attachment)}>
                  <ViewIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDownload(attachment)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
                {canDelete && (
                  <IconButton size="small" color="error" onClick={() => handleDelete(attachment)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedAttachment && (
        <SecureImageViewer
          attachmentId={selectedAttachment.attachmentId}
          fileName={selectedAttachment.fileName}
          fileType={selectedAttachment.fileType}
          open={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedAttachment(null);
          }}
          onDownload={() => handleDownload(selectedAttachment)}
        />
      )}
    </Box>
  );
};