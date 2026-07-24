import { Middleware } from '@reduxjs/toolkit';
import { 
  setConnectionStatus, 
  setSensorData, 
  setPrediction,
  setConnectionError
} from '../slices/sensorSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.ishara.com/ws';

export const websocketMiddleware: Middleware = store => {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = async () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    store.dispatch(setConnectionStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting'));

    try {
      // Optional: Pass JWT token if backend requires authenticated WS
      const token = await AsyncStorage.getItem('userToken');
      const url = token ? `${WS_BASE_URL}?token=${token}` : WS_BASE_URL;

      socket = new WebSocket(url);

      socket.onopen = () => {
        reconnectAttempts = 0;
        store.dispatch(setConnectionStatus('connected'));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'sensor_data':
              store.dispatch(setSensorData({
                flexSensors: data.payload.flexSensors || [0,0,0,0,0],
                orientation: data.payload.orientation || { pitch: 0, roll: 0, yaw: 0 },
                battery: data.payload.battery || null,
              }));
              break;
            case 'prediction':
              store.dispatch(setPrediction({
                sign: data.payload.sign,
                confidence: data.payload.confidence,
              }));
              break;
            case 'status':
              // Handle backend-specific status messages
              break;
            default:
              console.warn('Unknown WS message type:', data.type);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      socket.onclose = (event: any) => {
        socket = null;
        if (event.wasClean || event.code === 1000) {
          store.dispatch(setConnectionStatus('disconnected'));
        } else {
          // Unexpected close, attempt reconnect
          handleReconnect();
        }
      };

      socket.onerror = (error) => {
        store.dispatch(setConnectionError('WebSocket connection error'));
        // Error will also trigger onclose, which handles reconnect
      };

    } catch (err: any) {
      store.dispatch(setConnectionError(err.message || 'Failed to initialize WebSocket'));
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts += 1;
      const timeout = Math.min(10000, (2 ** reconnectAttempts) * 1000); // Exponential backoff (max 10s)
      
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
      socket.close(1000, 'User initiated disconnect');
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
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'command', command: 'start_recognition' }));
        }
        break;
      case WS_STOP_RECOGNITION:
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'command', command: 'stop_recognition' }));
        }
        break;
      default:
        return next(action);
    }
  };
};
