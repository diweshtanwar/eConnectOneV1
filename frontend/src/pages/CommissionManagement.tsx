import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
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
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | ''>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Dummy implementations for getMonthName and getStatusColor for now
  const getMonthName = (month: number) =>
    [ '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][month] || '';
  const getStatusColor = (status: string) => 'default';
  const handleCreateCommission = () => {};
  const handleBulkUpload = () => {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Commission Management</Typography>
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="View Commissions" />
        {(user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && <Tab label="Create Commission" />}
        {(user?.roleName === 'Master Admin' || user?.roleName === 'Admin') && <Tab label="Bulk Upload" />}
        <Tab label="Activity Log" />
      </Tabs>

      {tabIndex === 0 && (
        <CommissionListPage
          commissions={commissions}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          getMonthName={getMonthName}
          user={user}
          getStatusColor={getStatusColor}
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