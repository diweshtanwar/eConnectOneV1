import React from 'react';
import { Box, Paper, List, ListItem, ListItemIcon, ListItemText, Badge, Divider } from '@mui/material';
import { Build, AccountBalance, Savings, Dashboard } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface TicketNavigationProps {
  ticketCounts: {
    technical: { open: number; inProgress: number };
    withdrawal: { pending: number; processing: number };
    deposit: { pending: number; verifying: number };
  };
}

export const TicketNavigation: React.FC<TicketNavigationProps> = ({ ticketCounts }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      count: 0
    },
    {
      path: '/tickets/technical',
      label: 'Technical Support',
      icon: <Build />,
      count: ticketCounts.technical.open + ticketCounts.technical.inProgress,
      subtext: `${ticketCounts.technical.open} new, ${ticketCounts.technical.inProgress} active`
    },
    {
      path: '/tickets/withdrawals',
      label: 'Withdrawals',
      icon: <AccountBalance />,
      count: ticketCounts.withdrawal.pending + ticketCounts.withdrawal.processing,
      subtext: `${ticketCounts.withdrawal.pending} pending, ${ticketCounts.withdrawal.processing} processing`
    },
    {
      path: '/tickets/deposits',
      label: 'Deposits',
      icon: <Savings />,
      count: ticketCounts.deposit.pending + ticketCounts.deposit.verifying,
      subtext: `${ticketCounts.deposit.pending} pending, ${ticketCounts.deposit.verifying} verifying`
    }
  ];

  return (
    <Paper sx={{ width: 280, height: 'fit-content' }}>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem
              button
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' }
                }
              }}
            >
              <ListItemIcon>
                <Badge badgeContent={item.count > 0 ? item.count : null} color="error">
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.subtext}
              />
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};