import { Middleware } from '@reduxjs/toolkit';
import { 
  setConnectionStatus, 
  setSensorData, 
  setPrediction,
  setConnectionError
} from '../slices/sensorSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

// Define WS Actions
export const WS_CONNECT = 'ws/connect';
export const WS_DISCONNECT = 'ws/disconnect';
export const WS_START_RECOGNITION = 'ws/startRecognition';
export const WS_STOP_RECOGNITION = 'ws/stopRecognition';

// Action creators for UI to dispatch
export const connectWebSocket = () => ({ type: WS_CONNECT });
export const disconnectWebSocket = () => ({ type: WS_DISCONNECT });
export const startWsRecognition = () => ({ type: WS_START_RECOGNITION });
export const stopWsRecognition = () => ({ type: WS_STOP_RECOGNITION });

// Placeholder base URL - configure this via environment variables later (.env)
declare var process: any;
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://10.87.187.36:3000';

export const websocketMiddleware: Middleware = store => {
  let socket: Socket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = async () => {
    if (socket && socket.connected) {
      return;
    }

    store.dispatch(setConnectionStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting'));

    try {
      const token = await AsyncStorage.getItem('userToken');
      
      socket = io(WS_BASE_URL, {
        auth: token ? { token } : undefined,
        reconnection: false // We will handle reconnection manually for UI consistency
      });

      socket.on('connect', () => {
        reconnectAttempts = 0;
        store.dispatch(setConnectionStatus('connected'));
      });

      // Handle ML prediction broadcasted by our Node.js backend
      socket.on('ml_prediction_result', (result) => {
        if (result && result.prediction && result.confidence >= 75.0 ) {
          store.dispatch(setPrediction({
            sign: result.prediction || 'UNKNOWN',
            confidence: Math.round(result.confidence ?? 0)
          }));
        }
      });

      // Handle raw sensor data if needed
      socket.on('sensor_data', (data) => {
        store.dispatch(setSensorData({
          flexSensors: data.payload?.flexSensors || [0,0,0,0,0],
          orientation: data.payload?.orientation || { pitch: 0, roll: 0, yaw: 0 },
          battery: data.payload?.battery || null,
        }));
      });

      socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // the disconnection was initiated by the server/client explicitly
          store.dispatch(setConnectionStatus('disconnected'));
        } else {
          // unexpected close, attempt reconnect
          handleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        store.dispatch(setConnectionError(error.message || 'WebSocket connection error'));
        handleReconnect();
      });

    } catch (err: any) {
      store.dispatch(setConnectionError(err.message || 'Failed to initialize WebSocket'));
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts += 1;
      const timeout = Math.min(10000, (2 ** reconnectAttempts) * 1000); // Exponential backoff
      
      store.dispatch(setConnectionStatus('reconnecting'));
      
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        connect();
      }, timeout);
    } else {
      store.dispatch(setConnectionStatus('error'));
    }
  };

  const disconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectAttempts = 0;
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    store.dispatch(setConnectionStatus('disconnected'));
  };

  return next => action => {
    const act = action as any;
    switch (act.type) {
      case WS_CONNECT:
        connect();
        break;
      case WS_DISCONNECT:
        disconnect();
        break;
      case WS_START_RECOGNITION:
        if (socket && socket.connected) {
          socket.emit('command', { command: 'start_recognition' });
        }
        break;
      case WS_STOP_RECOGNITION:
        if (socket && socket.connected) {
          socket.emit('command', { command: 'stop_recognition' });
        }
        break;
      default:
        return next(action);
    }
  };
};
