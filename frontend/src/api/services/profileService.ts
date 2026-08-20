import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, BASE_URL } from '../apiClient';

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
  },

  uploadProfilePicture: async (imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type
    } as any);

    const token = await AsyncStorage.getItem('userToken');

    const response = await fetch(`${BASE_URL}/profile/picture`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type, fetch will automatically set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  }
};
