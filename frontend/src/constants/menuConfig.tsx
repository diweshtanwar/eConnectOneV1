import React from 'react';
import { PERMISSIONS } from './permissions';
import { DashboardIcon, HistoryIcon } from '../components/OptimizedIcons';
import { SupervisorAccount, Assignment, PostAdd, Settings, Email, Folder, AccountBalanceWallet, MonetizationOn } from '@mui/icons-material';

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  roles?: string[];
}

export const MENU_CONFIG: MenuItem[] = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard', 
    permission: PERMISSIONS.DASHBOARD 
  },
  { 
    text: 'User Management', 
    icon: <SupervisorAccount />, 
    path: '/users', 
    permission: PERMISSIONS.USER_MANAGEMENT 
  },
  { 
    text: 'Broadcast Management', 
    icon: <PostAdd />, 
    path: '/broadcast-management', 
    permission: PERMISSIONS.BROADCAST_MANAGEMENT 
  },
  { 
    text: 'Commission Management', 
    icon: <MonetizationOn />, 
    path: '/commission-management', 
    permission: PERMISSIONS.COMMISSION_MANAGEMENT 
  },
  { 
    text: 'Wallet Management', 
    icon: <AccountBalanceWallet />, 
    path: '/wallet-management', 
    roles: ['Master Admin', 'Admin'] 
  },
  { 
    text: 'Audit Logs', 
    icon: <HistoryIcon />, 
    path: '/auditlogs', 
    permission: PERMISSIONS.AUDIT_LOGS 
  },
  { 
    text: 'System Settings', 
    icon: <Settings />, 
    path: '/settings', 
    permission: PERMISSIONS.SYSTEM_SETTINGS 
  },
  { 
    text: 'Ticket Management', 
    icon: <Assignment />, 
    path: '/tickets', 
    permission: PERMISSIONS.TICKET_MANAGEMENT 
  },
  { 
    text: 'My Broadcasts', 
    icon: <Email />, 
    path: '/my-broadcasts', 
    roles: ['Master Admin', 'Admin', 'HO user', 'CSP'] 
  },
  { 
    text: 'Messages', 
    icon: <Email />, 
    path: '/messages', 
    permission: PERMISSIONS.MESSAGES 
  },
  { 
    text: 'Resource Center', 
    icon: <Folder />, 
    path: '/resources', 
    permission: PERMISSIONS.RESOURCE_CENTER 
  },
  { 
    text: 'Create Ticket', 
    icon: <PostAdd />, 
    path: '/create-ticket', 
    roles: ['Master Admin', 'Admin', 'HO user', 'CSP'] 
  },
  { 
    text: 'My Wallet', 
    icon: <AccountBalanceWallet />, 
    path: '/wallet', 
    roles: ['CSP'] 
  },
  { 
    text: 'My Tickets', 
    icon: <Assignment />, 
    path: '/my-tickets', 
    roles: ['Master Admin', 'Admin', 'HO user', 'CSP'] 
  },
  { 
    text: 'My Commissions', 
    icon: <MonetizationOn />, 
    path: '/my-commissions', 
    roles: ['CSP'] 
  },
  { 
    text: 'User Guide Management', 
    icon: <Folder />, 
    path: '/user-guide-management', 
    roles: ['Master Admin', 'Admin'] 
  },
  { 
    text: 'My User Guide', 
    icon: <Folder />, 
    path: '/my-user-guide', 
    roles: ['Master Admin', 'Admin', 'HO user', 'CSP'] 
  },
  { 
    text: 'Demo', 
    icon: <DashboardIcon />, 
    path: '/demo', 
    roles: ['Master Admin', 'Admin', 'HO user', 'CSP'] 
  },
];
