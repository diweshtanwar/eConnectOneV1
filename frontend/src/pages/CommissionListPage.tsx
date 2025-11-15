import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, Button
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';

interface CommissionListPageProps {
  commissions: any[];
  selectedYear: number | '';
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  selectedMonth: number | '';
  setSelectedMonth: (month: number) => void;
  getMonthName: (month: number) => string;
  user: any;
  getStatusColor: (status: string) => any;
}

const CommissionListPage: React.FC<CommissionListPageProps> = ({
  commissions,
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedMonth,
  setSelectedMonth,
  getMonthName,
  user,
  getStatusColor
}) => (
  <>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          label="Year"
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          displayEmpty
        >
          {availableYears.length === 0 && (
            <MenuItem value="">No Years</MenuItem>
          )}
          {availableYears.map(year => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Month"
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          displayEmpty
        >
          <MenuItem value=''>All</MenuItem>
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>{getMonthName(i + 1)}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
    {commissions.length === 0 ? (
      <Alert severity="info">
        No commissions found for {selectedYear}. {(user?.role === 'Master Admin' || user?.role === 'Admin') && 'Click "Create Commission" to add new commission records.'}
      </Alert>
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Base Commission</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Net Payable</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.commissionId}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {commission.user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {commission.user.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getMonthName(commission.month)} {commission.year}</TableCell>
                <TableCell>{commission.baseCommission}</TableCell>
                <TableCell>{commission.bonusCommission}</TableCell>
                <TableCell>{commission.deductions}</TableCell>
                <TableCell>{commission.taxDeducted}</TableCell>
                <TableCell>{commission.netPayable}</TableCell>
                <TableCell>
                  <Chip label={commission.status} color={getStatusColor(commission.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Edit />} onClick={() => {}} disabled>Edit</Button>
                  <Button size="small" startIcon={<Visibility />} onClick={() => {}} disabled>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </>
);

export default CommissionListPage;
