import React, { useState } from 'react';
import { Box, Typography, Button, LinearProgress, Alert, Chip } from '@mui/material';
import { compressFile, getCompressionInfo } from '../utils/fileCompression';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompressIcon from '@mui/icons-material/Compress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  maxSizeMB = 1,
  disabled = false
}) => {
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setCompressionInfo(null);

    // Check file size limit (10MB max before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB allowed.');
      return;
    }

    try {
      setCompressing(true);
      const originalSize = file.size;
      
      const compressedFile = await compressFile(file, {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        quality: 0.8
      });

      const info = getCompressionInfo(originalSize, compressedFile.size);
      setCompressionInfo(`Compressed: ${info.originalSizeMB}MB → ${info.compressedSizeMB}MB (${info.compressionRatio}% reduction)`);
      
      onFileSelect(compressedFile);
    } catch (err) {
      setError('Failed to compress file. Please try again.');
      console.error('Compression error:', err);
    } finally {
      setCompressing(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload-input"
        disabled={disabled || compressing}
      />
      <label htmlFor="file-upload-input">
        <Button
          variant="outlined"
          component="span"
          startIcon={compressing ? <CompressIcon /> : <CloudUploadIcon />}
          disabled={disabled || compressing}
          sx={{ mb: 1 }}
        >
          {compressing ? 'Compressing...' : 'Choose File'}
        </Button>
      </label>

      {compressing && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <LinearProgress />
          <Typography variant="caption" color="textSecondary">
            Compressing file to save server space...
          </Typography>
        </Box>
      )}

      {compressionInfo && (
        <Box sx={{ mt: 1 }}>
          <Chip 
            icon={<CompressIcon />}
            label={compressionInfo}
            color="success"
            size="small"
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
        Files are automatically compressed to save server space. Max {maxSizeMB}MB after compression.
      </Typography>
    </Box>
  );
};