import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

declare var process: any;


// Placeholder base URL - configure this via environment variables later (.env)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ishara.com/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple token refreshes simultaneously
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check for 401 and that this request wasn't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If it's a login or refresh request failing with 401, don't try to refresh again
      if (originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh')) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, enqueue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('userRefreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call a specific endpoint to refresh the token using another Axios instance to avoid loops
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        
        const { access_token, refresh_token: new_refresh_token } = response.data;
        
        await AsyncStorage.setItem('userToken', access_token);
        if (new_refresh_token) {
            await AsyncStorage.setItem('userRefreshToken', new_refresh_token);
        }

        isRefreshing = false;
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Refresh failed, log the user out
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
