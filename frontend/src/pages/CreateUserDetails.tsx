
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, MenuItem } from '@mui/material';
import { userApi } from '../api/api';

const statusOptions = [
	{ value: '1', label: 'Active' },
	{ value: '2', label: 'Inactive' },
];
const countryOptions = [
	{ value: '1', label: 'India' },
	{ value: '2', label: 'Other' },
];
const stateOptions = [
	{ value: '1', label: 'State 1' },
	{ value: '2', label: 'State 2' },
];
const cityOptions = [
	{ value: '1', label: 'City 1' },
	{ value: '2', label: 'City 2' },
];
const locationOptions = [
	{ value: '1', label: 'Location 1' },
	{ value: '2', label: 'Location 2' },
];

const initialState = {
	userId: '',
	address: '',
	qualification: '',
	profilePicSource: '',
	cityId: '',
	stateId: '',
	departmentId: '',
};


const CreateUserDetails: React.FC = () => {
	const [form, setForm] = useState(initialState);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	const validate = () => {
		if (!form.userId) return 'User ID is required.';
		return '';
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
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
		setLoading(true);
		try {
			const userId = parseInt(form.userId, 10);
			const details = {
				address: form.address,
				qualification: form.qualification,
				profilePicSource: form.profilePicSource,
				cityId: form.cityId ? parseInt(form.cityId, 10) : undefined,
				stateId: form.stateId ? parseInt(form.stateId, 10) : undefined,
				departmentId: form.departmentId ? parseInt(form.departmentId, 10) : undefined,
			};
			await userApi.updateGeneralUserDetails(userId, details);
			setSuccess('User detail created successfully!');
			setForm(initialState);
		} catch (err: any) {
			setError(err.message || 'Failed to create user detail');
		} finally {
			setLoading(false);
		}
	};

		return (
			<Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
				<Typography variant="h5" mb={2}>Create User Details</Typography>
				{error && <Alert severity="error">{error}</Alert>}
				{success && <Alert severity="success">{success}</Alert>}
				<TextField
					label="User ID"
					name="userId"
					value={form.userId}
					onChange={handleChange}
					fullWidth
					margin="normal"
					required
				/>
				<TextField
					label="Address"
					name="address"
					value={form.address}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="Qualification"
					name="qualification"
					value={form.qualification}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="Profile Pic Source"
					name="profilePicSource"
					value={form.profilePicSource}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="City ID"
					name="cityId"
					value={form.cityId}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="State ID"
					name="stateId"
					value={form.stateId}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="Department ID"
					name="departmentId"
					value={form.departmentId}
					onChange={handleChange}
					fullWidth
					margin="normal"
				/>
				<Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
					{loading ? 'Creating...' : 'Create'}
				</Button>
			</Box>
		);
};

export default CreateUserDetails;
