import React from 'react';
import { Box, Card, CardMedia, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';

interface TicketTypeImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  ticketType: number;
}

const getTypeLabel = (ticketType: number) => {
  switch (ticketType) {
    case 1: return 'Technical Evidence';
    case 2: return 'Withdrawal Docs';
    case 3: return 'Deposit Proof';
    default: return 'Documents';
  }
};

export const TicketTypeImagePreview: React.FC<TicketTypeImagePreviewProps> = ({
  files,
  onRemove,
  ticketType
}) => {
  if (files.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" gutterBottom>
        {getTypeLabel(ticketType)} ({files.length} file{files.length > 1 ? 's' : ''})
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {files.map((file, index) => (
          <Card key={index} sx={{ position: 'relative', width: 120, height: 120 }}>
            {file.type.startsWith('image/') ? (
              <CardMedia
                component="img"
                height="80"
                image={URL.createObjectURL(file)}
                alt={file.name}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}>
                <DescriptionIcon color="action" />
              </Box>
            )}
            <Box sx={{ p: 0.5, height: 40, overflow: 'hidden' }}>
              <Typography variant="caption" noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(255,255,255,0.8)' 
              }}
              onClick={() => onRemove(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Box>
  );
};