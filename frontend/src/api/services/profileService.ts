import { apiClient } from '../apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  },

  updateSettings: async (settingsData: any) => {
    const response = await apiClient.put('/profile/settings', settingsData);
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/profile/settings');
    return response.data;
  }
};
