import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, Alert, Table, TableHead, TableRow, TableCell, TableBody, Chip, LinearProgress } from '@mui/material';
import { CloudUpload, Download, CheckCircle } from '@mui/icons-material';
import { bulkImportApi, type BulkImportResultDto, type ImportLogDto } from '../api/api';

const importTypes = [
  {
    key: 'users',
    label: 'Users',
    sample: 'user_import_sample.csv',
    downloadSample: () => bulkImportApi.downloadSampleCsv(),
    importFunc: (file: File) => bulkImportApi.importUsers(file),
    format: 'Username, Password, Email, FullName, RoleName, MobileNumber, FatherName, MotherName',
    info: (
      <>
        • Passwords will be automatically hashed<br/>
        • <b>Username</b> is required and must be unique<br/>
        • <b>UserId</b> is NOT required and will be auto-generated<br/>
        • Valid roles: Admin, HO user, Master Admin, CSP<br/>
        • Password minimum length: 6 characters
      </>
    ),
    logColumns: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'errorMessage', label: 'Message' }
    ]
  },
  {
    key: 'user-details',
    label: 'User Details',
    sample: 'user_details_import_sample.csv',
    downloadSample: () => bulkImportApi.downloadSampleUserDetailsCsv(),
    importFunc: (file: File) => bulkImportApi.importUserDetails(file),
    format: 'Username, UserCode, FullName, BranchCode, ExpiryDate, BankName, BankAccount, IFSC, CertificateStatus, StatusId, CountryId, StateId, CityId, LocationId, Category, PAN, VoterId, AadharNo, Education',
    info: (
      <>
        • Username and UserCode must exist and be unique<br/>
        • All fields required unless specified<br/>
      </>
    ),
    logColumns: [
      { key: 'rowNumber', label: 'Row' },
      { key: 'username', label: 'Username' },
      { key: 'errorMessage', label: 'Message' }
    ]
  },
  {
    key: 'user-documents',
    label: 'User Documents',
    sample: 'user_documents_import_sample.csv',
    downloadSample: () => bulkImportApi.downloadSampleUserDocumentsCsv(),
    importFunc: (file: File) => bulkImportApi.importUserDocuments(file),
    format: 'UserCode, DocumentType, DocumentPath, UploadedDate, Description',
    info: (
      <>
        • UserCode must exist<br/>
        • DocumentType and DocumentPath are required<br/>
      </>
    ),
    logColumns: [
      { key: 'rowNumber', label: 'Row' },
      { key: 'errorMessage', label: 'Message' }
    ]
  }
];

const steps = ['Select Import Type', 'Upload CSV', 'Validate Data', 'Import Results'];

export const BulkImport: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importType, setImportType] = useState(importTypes[0]);

  const handleTypeSelect = (typeKey: string) => {
    const type = importTypes.find(t => t.key === typeKey);
    if (type) {
      setImportType(type);
      setActiveStep(1);
      setSelectedFile(null);
      setImportResult(null);
      setError(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setActiveStep(2);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setError(null);
    try {
      const result = await importType.importFunc(selectedFile);
      setImportResult(result);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await importType.downloadSample();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = importType.sample;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download sample file');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
    if (activeStep === 2) setSelectedFile(null);
    if (activeStep === 3) setImportResult(null);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    return status === 'Success' ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Bulk Import</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {/* Step 0: Select Import Type */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Select Import Type</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            {importTypes.map(type => (
              <Button
                key={type.key}
                variant={importType.key === type.key ? 'contained' : 'outlined'}
                onClick={() => handleTypeSelect(type.key)}
              >
                {type.label}
              </Button>
            ))}
          </Box>
        </Paper>
      )}
      {/* Step 1: Upload CSV */}
      {activeStep === 1 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Upload CSV File</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a CSV file containing {importType.label.toLowerCase()} data to import
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadSample}>
              Download Sample CSV
            </Button>
            <Button variant="contained" component="label" startIcon={<CloudUpload />}>
              Select CSV File
              <input type="file" accept=".csv" hidden onChange={handleFileSelect} />
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            CSV Format: {importType.format}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button onClick={handleBack}>Back</Button>
          </Box>
        </Paper>
      )}
      {/* Step 2: Validate Data */}
      {activeStep === 2 && selectedFile && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Validate & Import</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CheckCircle color="success" />
            <Typography>File selected: {selectedFile.name}</Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">{importType.info}</Typography>
          </Alert>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Start Import'}
            </Button>
          </Box>
          {importing && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing {importType.label.toLowerCase()}...
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      {/* Step 3: Import Results */}
      {activeStep === 3 && importResult && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Import Results</Typography>
          <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{importResult.totalRecords}</Typography>
              <Typography variant="body2">Total Records</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{importResult.successCount}</Typography>
              <Typography variant="body2">Successful</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{importResult.failureCount}</Typography>
              <Typography variant="body2">Failed</Typography>
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>Import Log</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                {importType.logColumns.map(col => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {importResult.logs.map((log, index) => (
                <TableRow key={index}>
                  {importType.logColumns.map(col => (
                    <TableCell key={col.key}>{(log as any)[col.key]}</TableCell>
                  ))}
                  <TableCell>
                    <Chip label={log.status} color={getStatusColor(log.status) as any} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleReset}>
              Import Another File
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};