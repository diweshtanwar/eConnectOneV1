import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Alert, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userApi, roleApi } from '../api/api';

const initialState = {
  username: '',
  password: '',
  roleId: '',
  email: '',
  fullName: '',
  mobileNumber: '',
  emergencyContactNumber: '',
  fatherName: '',
  motherName: '',
  cspCode: ''
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<{id: number, name: string}[]>([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdUsername, setCreatedUsername] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleApi.getAllRoles();
        setRoles(data);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const validate = () => {
    if (!form.username || form.username.trim().length === 0) return 'Username is required.';
    if (!form.password || form.password.length < 6) return 'Password is required (min 6 chars).';
    if (!form.roleId) return 'Role is required.';
    const selectedRole = roles.find(r => r.id === parseInt(form.roleId));
    if (selectedRole?.name === 'CSP' && !form.cspCode) return 'CSP Code is required for CSP users.';
    if (form.email && !emailRegex.test(form.email)) return 'Invalid email format.';
    if (form.email && form.email.length > 255) return 'Email max length is 255.';
    if (form.fullName && form.fullName.length > 255) return 'Full Name max length is 255.';
    if (form.mobileNumber && form.mobileNumber.length > 20) return 'Mobile Number max length is 20.';
    if (form.emergencyContactNumber && form.emergencyContactNumber.length > 20) return 'Emergency Contact Number max length is 20.';
    if (form.fatherName && form.fatherName.length > 255) return 'Father Name max length is 255.';
    if (form.motherName && form.motherName.length > 255) return 'Mother Name max length is 255.';
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
      const userDto: any = {
        username: form.username,
        password: form.password,
        roleId: parseInt(form.roleId, 10),
        email: form.email,
        fullName: form.fullName,
        mobileNumber: form.mobileNumber,
        emergencyContactNumber: form.emergencyContactNumber,
        fatherName: form.fatherName,
        motherName: form.motherName
      };
      if (form.cspCode) {
        userDto.cspCode = form.cspCode;
      }
      await userApi.createUser(userDto);
      setCreatedUsername(form.username);
      setSuccessDialogOpen(true);
      setForm(initialState);
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Create User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          name="username"
          value={form.username || ''}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ minLength: 6 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((show) => !show)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="Role"
          name="roleId"
          select
          value={form.roleId}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Mobile Number"
          name="mobileNumber"
          value={form.mobileNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Emergency Contact Number"
          name="emergencyContactNumber"
          value={form.emergencyContactNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Father Name"
          name="fatherName"
          value={form.fatherName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 255 }}
        />
        <TextField
          label="Mother Name"
          name="motherName"
          value={form.motherName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 255 }}
        />
        {roles.find(r => r.id === parseInt(form.roleId))?.name === 'CSP' && (
          <TextField
            label="CSP Code"
            name="cspCode"
            value={form.cspCode}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            helperText="Required for CSP users"
          />
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </form>

      <Dialog open={successDialogOpen} onClose={() => {}}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          User Created Successfully
        </DialogTitle>
        <DialogContent>
          <Typography>
            User <strong>{createdUsername}</strong> has been created successfully!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/user-management');
            }} 
            variant="contained" 
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateUser;
