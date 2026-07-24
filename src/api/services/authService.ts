import { apiClient } from '../apiClient';

export const authService = {
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (password: string, token: string) => {
    const response = await apiClient.post('/auth/reset-password', { password, token });
    return response.data;
  }
};
