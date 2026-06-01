import { apiFetch } from '@/lib/api';

export const dashboardApi = {
  getMetrics: async () => {
    return apiFetch('/dashboard/metrics');
  },
  getUpcomingRenewals: async () => {
    return apiFetch('/dashboard/upcoming-renewals');
  },
  getRecentOverdue: async () => {
    return apiFetch('/dashboard/recent-overdue');
  }
};
