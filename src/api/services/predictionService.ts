import { apiClient } from '../apiClient';

export const predictionService = {
  // Starts a session for live recognition (if backend requires it)
  startSession: async () => {
    const response = await apiClient.post('/prediction/start');
    return response.data;
  },
  
  // Submit sensor data payload to get an immediate prediction via REST
  predictSign: async (sensorData: any) => {
    const response = await apiClient.post('/prediction/predict', sensorData);
    return response.data; // e.g. { sign: "HELLO", confidence: 0.95 }
  },

  // Stop current recognition session
  stopSession: async () => {
    const response = await apiClient.post('/prediction/stop');
    return response.data;
  }
};
