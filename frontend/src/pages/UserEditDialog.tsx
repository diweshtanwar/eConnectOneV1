import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Tabs, Tab, Box, MenuItem } from '@mui/material';
import { UserResponseDto, userApi, locationApi } from '../api/api';

interface UserEditDialogProps {
  open: boolean;
  user: UserResponseDto | null;
  onClose: () => void;
  onSave: () => void;
}


const documentTypes = [
  { value: 'Aadhar', label: 'Aadhar Card' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'Bank', label: 'Bank Statement' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'Photo', label: 'Photograph' },
  { value: 'Education', label: 'Education Certificate' },
  { value: 'AddressProof', label: 'Address Proof' },
  { value: 'IncomeProof', label: 'Income Proof' },
  { value: 'IDProof', label: 'ID Proof' },
  { value: 'Signature', label: 'Signature' },
  { value: 'Other', label: 'Other Document' }
];

const UserEditDialog: React.FC<UserEditDialogProps> = ({ open, user, onClose, onSave }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<UserResponseDto>(user || {} as UserResponseDto);
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    code: '',
    branchCode: '',
    expiryDate: '',
    bankName: '',
    bankAccount: '',
    ifsc: '',
    certificateStatus: '',
    statusId: '',
    countryId: '',
    stateId: '',
    cityId: '',
    locationId: '',
    category: '',
    pan: '',
    voterId: '',
    aadharNo: '',
    education: '',
    address: '',
    qualification: '',
    profilePicSource: '',
    departmentId: ''
  });
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<{ id: number, name: string }[]>([]);
  const [states, setStates] = useState<{ id: number, name: string }[]>([]);

  React.useEffect(() => {
    if (user) {
      console.log('UserEditDialog - User data:', user);
      console.log('Username from user:', user.username);
      setForm({
        ...user,
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
    setDocType('');
    setFile(null);
    setError('');
    setSuccess('');
    // Fetch cities and states on open
    if (open) {
      locationApi.getCities().then(setCities);
      locationApi.getStates().then(setStates);
      // Fetch user details if user exists
      if (user && user.id) {
        userApi.getUserById(user.id)
          .then(userData => {
            const details = userData.generalDetails;
            if (details) {
              setDetailsForm({
                name: details.name || user.fullName || '',
                code: details.code || '',
                branchCode: details.branchCode || '',
                expiryDate: details.expiryDate ? details.expiryDate.substring(0, 10) : '',
                bankName: details.bankName || '',
                bankAccount: details.bankAccount || '',
                ifsc: details.ifsc || '',
                certificateStatus: details.certificateStatus || '',
                statusId: details.statusId ? String(details.statusId) : '',
                countryId: details.countryId ? String(details.countryId) : '',
                stateId: details.stateId ? String(details.stateId) : '',
                cityId: details.cityId ? String(details.cityId) : '',
                locationId: details.locationId ? String(details.locationId) : '',
                category: details.category || '',
                pan: details.pan || '',
                voterId: details.voterId || '',
                aadharNo: details.aadharNo || '',
                education: details.education || '',
                address: details.address || '',
                qualification: details.qualification || '',
                profilePicSource: details.profilePicSource || '',
                departmentId: details.departmentId ? String(details.departmentId) : ''
              });
            } else {
              setDetailsForm({
                name: user?.fullName || '',
                code: '',
                branchCode: '',
                expiryDate: '',
                bankName: '',
                bankAccount: '',
                ifsc: '',
                certificateStatus: '',
                statusId: '',
                countryId: '',
                stateId: '',
                cityId: '',
                locationId: '',
                category: '',
                pan: '',
                voterId: '',
                aadharNo: '',
                education: '',
                address: '',
                qualification: '',
                profilePicSource: '',
                departmentId: ''
              });
            }
          })
          .catch(() => {
            setDetailsForm({
              name: '',
              code: '',
              branchCode: '',
              expiryDate: '',
              bankName: '',
              bankAccount: '',
              ifsc: '',
              certificateStatus: '',
              statusId: '',
              countryId: '',
              stateId: '',
              cityId: '',
              locationId: '',
              category: '',
              pan: '',
              voterId: '',
              aadharNo: '',
              education: '',
              address: '',
              qualification: '',
              profilePicSource: '',
              departmentId: ''
            });
          });
      } else {
        setDetailsForm({
          name: user?.fullName || '',
          code: '',
          branchCode: '',
          expiryDate: '',
          bankName: '',
          bankAccount: '',
          ifsc: '',
          certificateStatus: '',
          statusId: '',
          countryId: '',
          stateId: '',
          cityId: '',
          locationId: '',
          category: '',
          pan: '',
          voterId: '',
          aadharNo: '',
          education: '',
          address: '',
          qualification: '',
          profilePicSource: '',
          departmentId: ''
        });
      }
    }
  }, [user, open]);

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'stateId') {
      setDetailsForm(prev => ({ ...prev, stateId: value, cityId: '' }));
    } else {
      setDetailsForm(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleUserSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const updateDto = {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        isActive: form.isActive
      };
      await userApi.updateUser(form.id, updateDto);
      setSuccess('User updated successfully!');
      onSave();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update user.');
    } finally { setLoading(false); }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!user) { setError('User ID is required.'); return; }
    setLoading(true);
    try {
      // Try to get details for user
      let details = null;
      try {
        details = await userApi.getGeneralUserDetails(user.id);
      } catch {}
      // If name changed, update user fullName as well
      if (detailsForm.name && detailsForm.name !== user.fullName) {
        await userApi.updateUser(user.id, { ...user, fullName: detailsForm.name });
      }
      const payload = {
        ...detailsForm,
        userId: user.id,
        cityId: detailsForm.cityId ? parseInt(detailsForm.cityId, 10) : undefined,
        stateId: detailsForm.stateId ? parseInt(detailsForm.stateId, 10) : undefined,
        departmentId: detailsForm.departmentId ? parseInt(detailsForm.departmentId, 10) : undefined,
        statusId: detailsForm.statusId ? parseInt(detailsForm.statusId, 10) : undefined,
        countryId: detailsForm.countryId ? parseInt(detailsForm.countryId, 10) : undefined,
        locationId: detailsForm.locationId ? parseInt(detailsForm.locationId, 10) : undefined,
      };
      await userApi.updateGeneralUserDetails(user.id, payload);
      setSuccess('User details updated successfully!');
      onSave();
      setDetailsForm({
        name: '',
        code: '',
        branchCode: '',
        expiryDate: '',
        bankName: '',
        bankAccount: '',
        ifsc: '',
        certificateStatus: '',
        statusId: '',
        countryId: '',
        stateId: '',
        cityId: '',
        locationId: '',
        category: '',
        pan: '',
        voterId: '',
        aadharNo: '',
        education: '',
        address: '',
        qualification: '',
        profilePicSource: '',
        departmentId: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update user details');
    } finally { setLoading(false); }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!user || !docType || !file) { setError('All fields are required.'); return; }
    setLoading(true);
    // TODO: Integrate with real API
    setTimeout(() => {
      setSuccess('Document uploaded successfully!');
      setDocType(''); setFile(null); setLoading(false);
    }, 800);
  };

  if (!user) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="User" />
          <Tab label="User Details" />
          <Tab label="User Documents" />
        </Tabs>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {tab === 0 && (
          <Box>
            <TextField 
              label="Username" 
              name="username" 
              value={form?.username || ''} 
              onChange={handleChange} 
              fullWidth 
              margin="normal"
              helperText="Current username"
            />
            <TextField label="Full Name" name="fullName" value={form.fullName || ''} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Email" name="email" value={form.email || ''} onChange={handleChange} fullWidth margin="normal" />
            {/* Add more fields as needed */}
            <Button onClick={handleUserSubmit} variant="contained" disabled={loading} sx={{ mt: 2 }}>{loading ? 'Saving...' : 'Save'}</Button>
          </Box>
        )}
        {tab === 1 && (
          <Box component="form" onSubmit={handleDetailsSubmit}>
            <TextField label="Name" name="name" value={detailsForm.name} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Code" name="code" value={detailsForm.code} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Branch Code" name="branchCode" value={detailsForm.branchCode} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Expiry Date" name="expiryDate" value={detailsForm.expiryDate} onChange={handleDetailsChange} fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} />
            <TextField label="Bank Name" name="bankName" value={detailsForm.bankName} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Bank Account" name="bankAccount" value={detailsForm.bankAccount} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="IFSC" name="ifsc" value={detailsForm.ifsc} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Certificate Status" name="certificateStatus" value={detailsForm.certificateStatus} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Status ID" name="statusId" value={detailsForm.statusId} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Country ID" name="countryId" value={detailsForm.countryId} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="State" name="stateId" value={detailsForm.stateId} onChange={handleDetailsChange} fullWidth margin="normal" select>
              {states.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField label="City" name="cityId" value={detailsForm.cityId} onChange={handleDetailsChange} fullWidth margin="normal" select>
              {cities.filter(c => !detailsForm.stateId || c.stateId === parseInt(detailsForm.stateId, 10)).map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Location ID" name="locationId" value={detailsForm.locationId} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Category" name="category" value={detailsForm.category} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="PAN" name="pan" value={detailsForm.pan} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Voter ID" name="voterId" value={detailsForm.voterId} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Aadhar No" name="aadharNo" value={detailsForm.aadharNo} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Education" name="education" value={detailsForm.education} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Address" name="address" value={detailsForm.address} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Qualification" name="qualification" value={detailsForm.qualification} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Profile Pic Source" name="profilePicSource" value={detailsForm.profilePicSource} onChange={handleDetailsChange} fullWidth margin="normal" />
            <TextField label="Department ID" name="departmentId" value={detailsForm.departmentId} onChange={handleDetailsChange} fullWidth margin="normal" />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </Box>
        )}
        {tab === 2 && (
          <Box component="form" onSubmit={handleDocSubmit}>
            <TextField label="Document Type" select value={docType} onChange={e => setDocType(e.target.value)} fullWidth margin="normal" required>
              {documentTypes.map(dt => (
                <MenuItem key={dt.value} value={dt.value}>{dt.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
              {file ? file.name : 'Select File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditDialog;
