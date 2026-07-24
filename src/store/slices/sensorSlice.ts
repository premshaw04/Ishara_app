import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface OrientationData {
  pitch: number;
  roll: number;
  yaw: number;
}

export interface PredictionData {
  sign: string;
  confidence: number;
}

interface SensorState {
  status: ConnectionStatus;
  battery: number | null;
  flexSensors: number[];
  orientation: OrientationData | null;
  prediction: PredictionData | null;
  error: string | null;
}

const initialState: SensorState = {
  status: 'disconnected',
  battery: null,
  flexSensors: [0, 0, 0, 0, 0], // Default 5 flex sensors
  orientation: null,
  prediction: null,
  error: null,
};

const sensorSlice = createSlice({
  name: 'sensor',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
      if (action.payload === 'connected') {
        state.error = null;
      }
    },
    setSensorData: (
      state,
      action: PayloadAction<{ flexSensors: number[]; orientation: OrientationData; battery: number }>
    ) => {
      state.flexSensors = action.payload.flexSensors;
      state.orientation = action.payload.orientation;
      state.battery = action.payload.battery;
    },
    setPrediction: (state, action: PayloadAction<PredictionData>) => {
      state.prediction = action.payload;
    },
    clearPrediction: (state) => {
      state.prediction = null;
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const {
  setConnectionStatus,
  setSensorData,
  setPrediction,
  clearPrediction,
  setConnectionError,
} = sensorSlice.actions;

export default sensorSlice.reducer;
