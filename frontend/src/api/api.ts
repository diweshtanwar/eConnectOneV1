// --- Broadcast API for Management and My Broadcasts ---
export const getMyBroadcasts = async () => {
  const response = await api.get('/broadcast/my');
  return response.data;
};

export const getAllBroadcasts = async () => {
  const response = await api.get('/broadcast/all');
  return response.data;
};

export const sendBroadcast = async (broadcast: any) => {
  const response = await api.post('/broadcast/send', broadcast);
  return response.data;
};

export const editBroadcast = async (id: number, broadcast: any) => {
  const response = await api.put(`/broadcast/edit/${id}`, broadcast);
  return response.data;
};

export const deleteBroadcast = async (id: number) => {
  const response = await api.delete(`/broadcast/delete/${id}`);
  return response.data;
};
// --- Audit Log API ---
export const auditApi = {
  // Clean audit logs before a specific date
  cleanLogsBeforeDate: async (date: string) => {
    const response = await api.post('/AuditLogs/clean', { beforeDate: date });
    return response.data;
  },
  // Clean audit logs older than N days
  cleanLogsOlderThanDays: async (days: number) => {
    const response = await api.post('/AuditLogs/clean', { days });
    return response.data;
  },
};
import axios from 'axios';
import { apiCache } from '../utils/apiCache';

// Detect environment and set base URL
const getApiBaseUrl = () => {
  // Check for environment variable first (set during build)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in production (GitHub Pages)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production - use Railway backend (update with your actual URL)
    return 'https://centerbeam.proxy.rlwy.net:57891/api';
  }
  
  // Development - use local backend
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

// New DTO Interfaces (matching backend DTOs)
export interface UserCreateDto {
  username: string;
  password: string;
  roleId: number;
  email?: string;
  fullName?: string;
  mobileNumber?: string;
  emergencyContactNumber?: string;
  fatherName?: string;
  motherName?: string;
}

export interface UserUpdateDto {
  username?: string;
  password?: string;
  roleId?: number;
  email?: string;
  fullName?: string;
  mobileNumber?: string;
  emergencyContactNumber?: string;
  fatherName?: string;
  motherName?: string;
  isActive?: boolean;
}

export interface GeneralUserDetailDto {
  id?: number;
  address?: string;
  qualification?: string;
  profilePicSource?: string;
  cityId?: number;
  stateId?: number;
  departmentId?: number;
  designationId?: number;
}

export interface CSPDetailDto {
  id?: number;
  cspName?: string;
  cspCode?: string;
  branchCode?: string;
  expiryDate?: string; // Use string for Date
  bankName?: string;
  bankAccount?: string;
  ifsc?: string;
  certificateStatus?: string;
  statusId?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  locationId?: number;
  category?: string;
  pan?: string;
  voterId?: string;
  aadharNo?: string;
  education?: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  mobileNumber?: string;
  emergencyContactNumber?: string;
  fatherName?: string;
  motherName?: string;
  roleName: string;
  isActive: boolean;
  createdAt: string; // Use string for Date
  lastLoginAt?: string; // Use string for Date
  isDeleted: boolean; // Added

  generalDetails?: GeneralUserDetailDto;
  cspDetails?: CSPDetailDto;
}

// Ticket Management DTOs
export interface TechnicalDetailDto {
  problemTypeId?: number;
  problemTypeName?: string;
  resolutionProvidedByUserId?: number;
  resolutionProvidedByUsername?: string;
  anyDeskDetail?: string;
}

export interface WithdrawalDetailDto {
  amount: number;
  account?: string;
  isConfigured: boolean;
  isMake: boolean;
  isAuthorized: boolean;
  authorizedAmount?: number;
}

export interface DepositDetailDto {
  amount: number;
  depositDate?: string;
  hasReceipt: boolean;
  receiptSource?: string;
  isVerified: boolean;
}

export interface AttachmentDto {
  attachmentId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  uploadedByUserId: number;
  uploadedByUsername?: string;
  uploadedDate: string;
}

export interface TicketHistoryDto {
  historyId: string;
  changeType: string;
  oldValue?: string;
  newValue?: string;
  changedByUserId: number;
  changedByUsername?: string;
  changedDate: string;
}

export interface TicketDto {
  ticketId: string;
  typeId: number;
  typeName?: string;
  raisedByUserId: number;
  raisedByUsername?: string;
  requesterEmail?: string;
  requesterMobile?: string;
  summary: string;
  description?: string;
  statusId: number;
  statusName?: string;
  requestedDate: string;
  completionDate?: string;
  resolutionDetail?: string;
  comment?: string;
  createdDate: string;
  createdByUsername?: string;
  updatedDate?: string;
  updatedByUsername?: string;
  isDeleted: boolean;
  technicalDetail?: TechnicalDetailDto;
  withdrawalDetail?: WithdrawalDetailDto;
  depositDetail?: DepositDetailDto;
  attachments?: AttachmentDto[];
  ticketHistory?: TicketHistoryDto[];
}

export interface TechnicalDetailCreateDto {
  problemTypeId?: number;
  anyDeskDetail?: string;
}

export interface WithdrawalDetailCreateDto {
  amount: number;
  account?: string;
}

export interface DepositDetailCreateDto {
  amount: number;
  depositDate?: string;
}

export interface TicketCreateDto {
  typeId: number;
  raisedByUserId?: number;
  requesterEmail?: string;
  requesterMobile?: string;
  summary: string;
  description?: string;
  statusId: number;
  technicalDetail?: TechnicalDetailCreateDto;
  withdrawalDetail?: WithdrawalDetailCreateDto;
  depositDetail?: DepositDetailCreateDto;
}

export interface TechnicalDetailUpdateDto {
  problemTypeId?: number;
  resolutionProvidedByUserId?: number;
  anyDeskDetail?: string;
}

export interface WithdrawalDetailUpdateDto {
  amount?: number;
  account?: string;
  isConfigured?: boolean;
  isMake?: boolean;
  isAuthorized?: boolean;
  authorizedAmount?: number;
}

export interface DepositDetailUpdateDto {
  amount?: number;
  depositDate?: string;
  hasReceipt?: boolean;
  receiptSource?: string;
  isVerified?: boolean;
}

export interface TicketUpdateDto {
  ticketId: string;
  summary?: string;
  description?: string;
  statusId?: number;
  completionDate?: string;
  resolutionDetail?: string;
  comment?: string;
  isDeleted?: boolean;
  technicalDetail?: TechnicalDetailUpdateDto;
  withdrawalDetail?: WithdrawalDetailUpdateDto;
  depositDetail?: DepositDetailUpdateDto;
}

export interface AttachmentUploadDto {
  ticketId: string;
  file: File; // Use File type for browser file uploads
  fileType?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export interface PasswordResetDto {
  newPassword: string;
}

export interface RolePermissionDto {
  id: number;
  roleId: number;
  roleName: string;
  permission: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface UpdateRolePermissionDto {
  roleId: number;
  permission: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface BulkImportResultDto {
  totalRecords: number;
  successCount: number;
  failureCount: number;
  logs: ImportLogDto[];
}

export interface ImportLogDto {
  rowNumber: number;
  status: string;
  username: string;
  email: string;
  errorMessage: string;
  processedAt: string;
}

export interface AccountLockoutDto {
  userId: number;
  username: string;
  loginId: string;
  fullName: string;
  email: string;
  roleName: string;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null;
  lastFailedLoginAt: string | null;
  remainingAttempts: number;
}

export interface UnlockAccountDto {
  userId: number;
  newPassword?: string;
  resetPassword: boolean;
}

export const userApi = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getAllUsers: async (pageNumber: number = 1, pageSize: number = 10) => {
    const response = await api.get<UserResponseDto[]>(`/users?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },
  getUserById: async (id: number) => {
    const response = await api.get<UserResponseDto>(`/users/${id}`);
    return response.data;
  },
  // Fetches the full user, including generalDetails, by userId
  getGeneralUserDetails: async (userId: number) => {
    const response = await api.get<UserResponseDto>(`/users/${userId}`);
    return response.data.generalDetails || null;
  },
  createUser: async (userDto: UserCreateDto) => {
    const response = await api.post<UserResponseDto>('/users', userDto);
    return response.data;
  },
  updateUser: async (id: number, userDto: UserUpdateDto) => {
    const response = await api.put<UserResponseDto>(`/users/${id}`, userDto);
    return response.data;
  },
  updateGeneralUserDetails: async (userId: number, detailsDto: GeneralUserDetailDto) => {
    const response = await api.put<UserResponseDto>(`/users/${userId}/general-details`, detailsDto);
    return response.data;
  },
  updateCSPDetails: async (userId: number, detailsDto: CSPDetailDto) => {
    const response = await api.put<UserResponseDto>(`/users/${userId}/csp-details`, detailsDto);
    return response.data;
  },
  softDeleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  restoreUser: async (id: number) => {
    const response = await api.post(`/users/${id}/restore`);
    return response.data;
  },
  resetUserPassword: async (userId: number, passwordResetDto: PasswordResetDto) => {
    const response = await api.post(`/users/${userId}/reset-password`, passwordResetDto);
    return response.data;
  },
  resetMyPassword: async (passwordResetDto: PasswordResetDto) => {
    const response = await api.post('/users/reset-my-password', passwordResetDto);
    return response.data;
  },
};

// City/State API helpers
export const locationApi = {
  getCities: async () => {
    const response = await api.get('/cities');
    return response.data;
  },
  getStates: async () => {
    const response = await api.get('/states');
    return response.data;
  },
};

export const ticketsApi = {
  getAllTickets: async () => {
    const cacheKey = 'tickets-all';
    const cached = apiCache.get<TicketDto[]>(cacheKey);
    if (cached) return cached;

    const response = await api.get<TicketDto[]>('/Tickets');
    apiCache.set(cacheKey, response.data, 2 * 60 * 1000); // Cache for 2 minutes
    return response.data;
  },
  getTicketsByType: async (typeId: number, includeClosed: boolean = false) => {
    const cacheKey = `tickets-type-${typeId}-${includeClosed}`;
    const cached = apiCache.get<TicketDto[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      typeId: typeId.toString(),
      includeClosed: includeClosed.toString()
    });
    const response = await api.get<TicketDto[]>(`/Tickets/by-type?${params}`);
    apiCache.set(cacheKey, response.data, 1 * 60 * 1000); // Cache for 1 minute
    return response.data;
  },
  getTicketById: async (id: string) => {
    const cacheKey = `ticket-${id}`;
    const cached = apiCache.get<TicketDto>(cacheKey);
    if (cached) return cached;

    const response = await api.get<TicketDto>(`/Tickets/${id}`);
    apiCache.set(cacheKey, response.data, 5 * 60 * 1000); // Cache for 5 minutes
    return response.data;
  },
  createTicket: async (ticket: TicketCreateDto) => {
    const response = await api.post<TicketDto>('/Tickets', ticket);
    return response.data;
  },
  updateTicket: async (id: string, ticket: TicketUpdateDto) => {
    const response = await api.put<TicketDto>(`/Tickets/${id}`, ticket);
    // Invalidate cache for this ticket and all tickets list
    apiCache.invalidate(`ticket-${id}`);
    apiCache.invalidate('tickets-all');
    return response.data;
  },
  deleteTicket: async (id: string) => {
    const response = await api.delete(`/Tickets/${id}`);
    // Invalidate cache for this ticket and all tickets list
    apiCache.invalidate(`ticket-${id}`);
    apiCache.invalidate('tickets-all');
    return response.data;
  },
  updateTicketStatus: async (id: string, newStatusId: number) => {
    const response = await api.put(`/Tickets/${id}/status/${newStatusId}`);
    // Invalidate cache for this ticket and all tickets list
    apiCache.invalidate(`ticket-${id}`);
    apiCache.invalidate('tickets-all');
    return response.data;
  },
  addCommentToTicket: async (id: string, comment: string) => {
    const response = await api.post(`/Tickets/${id}/comment`, `"${comment}"`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Invalidate cache for this ticket
    apiCache.invalidate(`ticket-${id}`);
    return response.data;
  },
  uploadAttachment: async (uploadDto: AttachmentUploadDto) => {
    const formData = new FormData();
    formData.append('ticketId', uploadDto.ticketId);
    formData.append('file', uploadDto.file);
    if (uploadDto.fileType) {
      formData.append('fileType', uploadDto.fileType);
    }

    const response = await api.post<AttachmentDto>('/Attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Invalidate cache for the ticket
    apiCache.invalidate(`ticket-${uploadDto.ticketId}`);
    return response.data;
  },
  getAttachmentsByTicketId: async (ticketId: string) => {
    const response = await api.get<AttachmentDto[]>(`/Attachments/ticket/${ticketId}`);
    return response.data;
  },
  deleteAttachment: async (attachmentId: string) => {
    const response = await api.delete(`/Attachments/${attachmentId}`);
    // Note: We can't invalidate specific ticket cache here without knowing ticketId
    // Consider adding ticketId parameter or invalidating all ticket caches
    return response.data;
  },
  downloadAttachment: async (attachmentId: string) => {
    const response = await api.get(`/Attachments/download/${attachmentId}`, {
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  },
};

export const systemSettingsApi = {
  getRolePermissions: async () => {
    const response = await api.get<RolePermissionDto[]>('/rolepermissions');
    return response.data;
  },
  createRolePermission: async (permission: UpdateRolePermissionDto) => {
    const response = await api.post<RolePermissionDto>('/rolepermissions', permission);
    return response.data;
  },
  updateRolePermission: async (id: number, permission: UpdateRolePermissionDto) => {
    const response = await api.put<RolePermissionDto>(`/rolepermissions/${id}`, permission);
    return response.data;
  },
  deleteRolePermission: async (id: number) => {
    await api.delete(`/rolepermissions/${id}`);
  },
  getAvailablePermissions: async () => {
    const response = await api.get<string[]>('/rolepermissions/available-permissions');
    return response.data;
  },
  getUserPermissions: async () => {
    const response = await api.get('/rolepermissions/user-permissions');
    return response.data;
  },
};

export const messagesApi = {
  getInbox: async () => {
    const response = await api.get('/messages/inbox');
    return response.data;
  },
  getSent: async () => {
    const response = await api.get('/messages/sent');
    return response.data;
  },
  sendMessage: async (message: any) => {
    const response = await api.post('/messages/send', message);
    return response.data;
  },
  markAsRead: async (id: number) => {
    await api.put(`/messages/${id}/read`);
  },
};

export const chatApi = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/chat/messages/${conversationId}`);
    return response.data;
  },
  sendMessage: async (message: any) => {
    const response = await api.post('/chat/send', message);
    return response.data;
  },
  markAsRead: async (conversationId: string) => {
    await api.put(`/chat/read/${conversationId}`);
  },
};

export const broadcastApi = {
  sendBroadcast: async (broadcast: any) => {
    const response = await api.post('/broadcast/send', broadcast);
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/broadcast/notifications');
    return response.data;
  },
  markAsRead: async (receiptId: number) => {
    await api.put(`/broadcast/read/${receiptId}`);
  },
  getUnreadCount: async () => {
    const response = await api.get('/broadcast/unread-count');
    return response.data;
  },
};

export const resourceCenterApi = {
  getCategories: async () => {
    const response = await api.get('/resourcecenter/categories');
    return response.data;
  },
  getResources: async (categoryId?: number | null, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (search) params.append('search', search);
    const response = await api.get(`/resourcecenter/resources?${params}`);
    return response.data;
  },
  getFeaturedResources: async () => {
    const response = await api.get('/resourcecenter/featured');
    return response.data;
  },
  createCategory: async (category: any) => {
    const response = await api.post('/resourcecenter/categories', category);
    return response.data;
  },
  createResource: async (resource: any) => {
    const response = await api.post('/resourcecenter/resources', resource);
    return response.data;
  },
  trackAccess: async (resourceId: number, accessType: string) => {
    await api.post(`/resourcecenter/resources/${resourceId}/access`, { accessType });
  },
};

export const bulkImportApi = {
  importUsers: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<BulkImportResultDto>('/bulkimport/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  downloadSampleCsv: async () => {
    const response = await api.get('/bulkimport/sample-csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const accountLockoutApi = {
  getLockedAccounts: async () => {
    const response = await api.get<AccountLockoutDto[]>('/accountlockout/locked-accounts');
    return response.data;
  },
  getAllAccountsStatus: async () => {
    const response = await api.get<AccountLockoutDto[]>('/accountlockout/all-accounts');
    return response.data;
  },
  unlockAccount: async (unlockDto: UnlockAccountDto) => {
    const response = await api.post('/accountlockout/unlock', unlockDto);
    return response.data;
  },
};

export const walletApi = {
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },
  getUserWallet: async (userId: number) => {
    const response = await api.get(`/wallet/user/${userId}`);
    return response.data;
  },
  getTransactions: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get(`/wallet/transactions?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
  adjustBalance: async (userId: number, amount: number, description?: string) => {
    const response = await api.post('/wallet/adjust', { userId, amount, description });
    return response.data;
  },
  processWithdrawal: async (ticketId: string, userId: number, requestedAmount: number, approvedAmount: number, comment?: string) => {
    const response = await api.post('/wallet/process-withdrawal', { 
      ticketId, 
      userId, 
      requestedAmount, 
      approvedAmount, 
      comment 
    });
    return response.data;
  },
  processDeposit: async (ticketId: string, userId: number, requestedAmount: number, approvedAmount: number, comment?: string) => {
    const response = await api.post('/wallet/process-deposit', { 
      ticketId, 
      userId, 
      requestedAmount, 
      approvedAmount, 
      comment 
    });
    return response.data;
  },
  bulkApprove: async (ticketIds: string[], approvalType: string, value: number, comment?: string) => {
    const response = await api.post('/wallet/bulk-approve', {
      ticketIds,
      approvalType,
      value,
      comment
    });
    return response.data;
  },
};

export const sessionApi = {
  getConfig: async () => {
    const response = await api.get('/session/config');
    return response.data;
  },
  updateConfig: async (idleTimeoutMinutes: number) => {
    const response = await api.post('/session/config', { idleTimeoutMinutes });
    return response.data;
  },
};

export const riskManagementApi = {
  getAlerts: async () => {
    const response = await api.get('/risk-management/alerts');
    return response.data;
  },
  assessRisk: async (ticketId: string) => {
    const response = await api.get(`/risk-management/assess/${ticketId}`);
    return response.data;
  },
  getUserLimits: async (userId: number) => {
    const response = await api.get(`/risk-management/limits/${userId}`);
    return response.data;
  },
  validateTransaction: async (userId: number, amount: number, transactionType: string) => {
    const response = await api.post('/risk-management/validate', {
      userId,
      amount,
      transactionType
    });
    return response.data;
  },
  updateUserLimits: async (userId: number, limits: any) => {
    const response = await api.put(`/risk-management/limits/${userId}`, limits);
    return response.data;
  },
};

export const commissionApi = {
  getCommissions: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/commission${params}`);
    return response.data;
  },
  getCommission: async (commissionId: string) => {
    const response = await api.get(`/commission/${commissionId}`);
    return response.data;
  },
  createCommission: async (commission: any) => {
    const response = await api.post('/commission', commission);
    return response.data;
  },
  updateCommissionStatus: async (commissionId: string, status: string, remarks?: string) => {
    const response = await api.put(`/commission/${commissionId}/status`, { status, remarks });
    return response.data;
  },
  getAvailableYears: async () => {
    const response = await api.get('/commission/years');
    return response.data;
  },
};

export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.userType) params.append('userType', filters.userType);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/dashboard/stats?${params}`);
    return response.data;
  },
};

export { api };
export default api;