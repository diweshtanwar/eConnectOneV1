import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, MenuItem, Chip, LinearProgress } from '@mui/material';
import { compressFile, getCompressionInfo } from '../utils/fileCompression';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const documentTypes = [
	'Agreement',
	'ID Proof',
	'Address Proof',
	'Bank Statement',
	'Other'
];

const initialState = {
	code: '',
	documentType: '',
	documentPath: '',
};

const CreateUserDocuments: React.FC = () => {
	const [form, setForm] = useState(initialState);
	const [file, setFile] = useState<File | null>(null);
	const [compressedFile, setCompressedFile] = useState<File | null>(null);
	const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
	const [compressing, setCompressing] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	// Validation helpers
	const validate = () => {
		if (!form.code.trim()) return 'User Code is required.';
		if (!form.documentType) return 'Document Type is required.';
		if (!file) return 'Document file is required.';
		if (form.code.length > 50) return 'User Code max length is 50.';
		return '';
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setError('');
			setCompressionInfo(null);
			setFile(selectedFile);
			setCompressedFile(null);
			// Compress file
			try {
				setCompressing(true);
				const originalSize = selectedFile.size;
				const compressed = await compressFile(selectedFile, {
					maxSizeMB: 1,
					maxWidthOrHeight: 1920,
					quality: 0.8
				});
				setCompressedFile(compressed);
				const info = getCompressionInfo(originalSize, compressed.size);
				setCompressionInfo(`Compressed: ${info.originalSizeMB}MB → ${info.compressedSizeMB}MB (${info.compressionRatio}% reduction)`);
			} catch (err) {
				setError('Failed to compress file. Please try again.');
				setCompressedFile(null);
			} finally {
				setCompressing(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		const validationMsg = validate();
		if (validationMsg) {
			setError(validationMsg);
			return;
		}
		if (!compressedFile) {
			setError('File compression not complete or failed.');
			return;
		}
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('code', form.code);
			formData.append('documentType', form.documentType);
			formData.append('file', compressedFile);

			const res = await fetch('/api/userdocuments', {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				const errText = await res.text();
				throw new Error(errText || 'Failed to create user document');
			}
			setSuccess('User document created successfully!');
			setForm(initialState);
			setFile(null);
			setCompressedFile(null);
		} catch (err: any) {
			setError(err.message || 'Failed to create user document');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" mb={2}>Create User Document</Typography>
			{error && <Alert severity="error">{error}</Alert>}
			{success && <Alert severity="success">{success}</Alert>}
			{/* ...form fields, refactored to use user-centric naming... */}
			<Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
				{loading ? 'Creating...' : 'Create'}
			</Button>
		</Box>
	);
};

export default CreateUserDocuments;
