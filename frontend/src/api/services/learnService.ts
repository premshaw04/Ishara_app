import { apiClient } from '../apiClient';

export const learnService = {
  getCategories: async () => {
    const response = await apiClient.get('/learn/categories');
    return response.data;
  },

  getSignsByCategory: async (categoryId: string) => {
    const response = await apiClient.get(`/learn/categories/${categoryId}/signs`);
    return response.data;
  },

  getSignDetails: async (signId: string) => {
    const response = await apiClient.get(`/learn/signs/${signId}`);
    return response.data;
  },

  searchSigns: async (query: string) => {
    const response = await apiClient.get('/learn/signs/search', { params: { q: query } });
    return response.data;
  },

  updateProgress: async (signId: string, status: 'practiced' | 'mastered') => {
    const response = await apiClient.post(`/learn/signs/${signId}/progress`, { status });
    return response.data;
  }
};
