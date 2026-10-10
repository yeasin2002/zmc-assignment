import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/query-list/dashboard.query';

export const DASHBOARD_KEYS = {
  all: () => ['dashboard'] as const,
  stats: () => ['dashboard', 'stats'] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats(),
    queryFn: () => dashboardApi.getStats(),
    select: (response) => response.data,
  });
};
