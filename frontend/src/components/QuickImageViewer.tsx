import React, { useState } from 'react';
import { Box, IconButton, Dialog, DialogContent, Badge, ImageList, ImageListItem } from '@mui/material';
import { Image, ZoomIn, ZoomOut, Close } from '@mui/icons-material';
import { AttachmentDto } from '../api/api';

interface QuickImageViewerProps {
  attachments: AttachmentDto[];
}

export const QuickImageViewer: React.FC<QuickImageViewerProps> = ({ attachments }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const imageAttachments = attachments.filter(att => 
    att.fileType?.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(att.fileName)
  );

  if (imageAttachments.length === 0) return null;

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
    setViewerOpen(true);
    setZoom(1);
  };

  return (
    <>
      <Badge badgeContent={imageAttachments.length} color="primary">
        <IconButton
          size="small"
          onClick={() => {
            if (imageAttachments.length === 1) {
              handleImageClick(imageAttachments[0].filePath);
            } else {
              setViewerOpen(true);
            }
          }}
        >
          <Image />
        </IconButton>
      </Badge>

      <Dialog 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              {selectedImage && (
                <>
                  <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}>
                    <ZoomIn />
                  </IconButton>
                  <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}>
                    <ZoomOut />
                  </IconButton>
                </>
              )}
            </Box>
            <IconButton onClick={() => setViewerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {selectedImage ? (
            <Box sx={{ textAlign: 'center', overflow: 'auto', maxHeight: '70vh' }}>
              <img
                src={`/api/attachments/download/${selectedImage}`}
                alt="Attachment"
                style={{
                  maxWidth: '100%',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.3s'
                }}
              />
            </Box>
          ) : (
            <ImageList cols={3} gap={8}>
              {imageAttachments.map((attachment) => (
                <ImageListItem 
                  key={attachment.attachmentId}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleImageClick(attachment.attachmentId)}
                >
                  <img
                    src={`/api/attachments/download/${attachment.attachmentId}`}
                    alt={attachment.fileName}
                    loading="lazy"
                    style={{ height: 120, objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};