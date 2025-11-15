import api from './api';

export interface DashboardStats {
  withdrawalRequests: {
    open: number;
    closed: number;
  };
  depositRequests: {
    open: number;
    closed: number;
  };
  supportRequests: {
    open: number;
    inProgress: number;
    closed: number;
  };
  cspCount: number;
  userCount: number;
  activeHOUsers: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getTicketStats: async () => {
    const response = await api.get('/dashboard/ticket-stats');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/dashboard/user-stats');
    return response.data;
  }
};