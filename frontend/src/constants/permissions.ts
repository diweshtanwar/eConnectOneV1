// Permission constants matching database Permission field
export const PERMISSIONS = {
  DASHBOARD: 'Dashboard',
  USER_MANAGEMENT: 'UserManagement',
  TICKET_MANAGEMENT: 'TicketManagement',
  AUDIT_LOGS: 'AuditLogs',
  SYSTEM_SETTINGS: 'SystemSettings',
  BROADCAST_MANAGEMENT: 'BroadcastManagement',
  COMMISSION_MANAGEMENT: 'CommissionManagement',
  WALLET_MANAGEMENT: 'WalletManagement',
  RESOURCE_CENTER: 'ResourceCenter',
  MESSAGES: 'Messages',
} as const;

// Note: Menu items without DB permissions use role-based fallback
// Examples: My Broadcasts, Create Ticket, My Wallet, My Tickets, My Commissions, User Guide, Demo

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
