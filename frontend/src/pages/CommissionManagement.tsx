import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Alert } from '@mui/material';
import CommissionListPage from './CommissionListPage';
import CommissionCreatePage from './CommissionCreatePage';
import CommissionBulkUploadPage from './CommissionBulkUploadPage';
import CommissionActivityLogPage from './CommissionActivityLogPage';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

interface Commission {
  commissionId: string;
  userId: number;
  user: { fullName: string; username: string };
  month: number;
  year: number;
  baseCommission: number;
  bonusCommission: number;
  deductions: number;
  totalCommission: number;
  taxDeducted: number;
  netPayable: number;
  status: string;
  description?: string;
  createdDate: string;
}

export const CommissionManagement: React.FC = () => {
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | ''>(new Date().getFullYear());
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    if (initialLoad) {
      fetchAvailableYears();
      setInitialLoad(false);
    } else {
      fetchCommissions();
    }
  }, [selectedYear, initialLoad]);

  useEffect(() => {
    if (!initialLoad) {
      fetchCommissions();
    }
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/commission${selectedYear ? `?year=${selectedYear}` : ''}`);
      setCommissions(data.data);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const data = await api.get('/commission/years');
      setAvailableYears(data.data);
      if (data.data.length > 0 && !selectedYear) {
        setSelectedYear(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const getMonthName = (month: number) =>
    [ '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][month] || '';
  const getStatusColor = (status: string) => 'default';
  
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleCreateCommission = async () => {
    try {
      await api.post('/commission', formData);
      setSuccessMessage('Commission created successfully!');
      setTabIndex(0);
      fetchCommissions();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Failed to create commission:', error);
    }
  };
  
  const handleBulkUpload = () => {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Commission Management</Typography>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="View Commissions" />
        {(user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && <Tab label="Create Commission" />}
        {(user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && <Tab label="Bulk Upload" />}
        <Tab label="Activity Log" />
      </Tabs>

      {tabIndex === 0 && (
        <CommissionListPage
          commissions={selectedMonth ? commissions.filter(c => c.month === selectedMonth) : commissions}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          getMonthName={getMonthName}
          user={user}
          getStatusColor={getStatusColor}
          onRefresh={fetchCommissions}
        />
      )}

      {tabIndex === 1 && (user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && (
        <CommissionCreatePage
          open={true}
          onClose={() => setTabIndex(0)}
          formData={formData}
          setFormData={setFormData}
          users={users}
          getMonthName={getMonthName}
          handleCreateCommission={handleCreateCommission}
        />
      )}

      {tabIndex === 2 && (user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && (
        <CommissionBulkUploadPage
          open={true}
          onClose={() => setTabIndex(0)}
          bulkFile={bulkFile}
          setBulkFile={setBulkFile}
          handleBulkUpload={handleBulkUpload}
        />
      )}

      {tabIndex === 3 && (
        <CommissionActivityLogPage activityLog={activityLog} />
      )}
    </Box>
  );
}