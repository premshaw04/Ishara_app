import { apiClient } from '../apiClient';

export const historyService = {
  getHistoryLogs: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await apiClient.get('/history', { params });
    return response.data;
  },

  deleteHistoryLog: async (logId: string) => {
    const response = await apiClient.delete(`/history/${logId}`);
    return response.data;
  },

  clearAllHistory: async () => {
    const response = await apiClient.delete('/history/all');
    return response.data;
  }
};
