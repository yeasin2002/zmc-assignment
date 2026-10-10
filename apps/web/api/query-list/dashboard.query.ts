import { axiosClient } from '@/lib/axios';

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
}

export const dashboardApi = {
  getStats: () =>
    axiosClient.get<DashboardStats>('/dashboard/stats'),
};
