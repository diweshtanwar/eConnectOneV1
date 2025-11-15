import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';

interface CommissionBulkUploadPageProps {
  open: boolean;
  onClose: () => void;
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  handleBulkUpload: () => void;
}

const CommissionBulkUploadPage: React.FC<CommissionBulkUploadPageProps> = ({
  open,
  onClose,
  bulkFile,
  setBulkFile,
  handleBulkUpload
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Bulk Upload Commissions</DialogTitle>
    <DialogContent>
      <Button
        variant="text"
        onClick={() => window.open('/templates/commission-bulk-template.xlsx', '_blank')}
        sx={{ mb: 2 }}
      >
        Download Bulk Upload Template
      </Button>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
        style={{ marginBottom: 16 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={handleBulkUpload} variant="contained" disabled={!bulkFile}>
        Upload
      </Button>
    </DialogActions>
  </Dialog>
);

export default CommissionBulkUploadPage;
