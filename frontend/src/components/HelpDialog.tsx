import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Keyboard } from '@mui/icons-material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const shortcuts = [
    { keys: 'Ctrl + R', action: 'Refresh tickets' },
    { keys: 'Alt + A', action: 'Quick approve selected' },
    { keys: 'Alt + R', action: 'Quick reject selected' },
    { keys: 'Alt + B', action: 'Toggle bulk mode' },
    { keys: 'Ctrl + F', action: 'Focus search' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Keyboard />
        Keyboard Shortcuts
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Use these shortcuts to process tickets faster:
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {shortcuts.map((shortcut, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip label={shortcut.keys} variant="outlined" size="small" />
              <Typography variant="body2">{shortcut.action}</Typography>
            </Box>
          ))}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          * Shortcuts work when not typing in input fields
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Got it</Button>
      </DialogActions>
    </Dialog>
  );
};