import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CALIBRATION_PROFILE, CalibrationProfile } from '../../utils/calibration';

export interface SettingsState {
  ttsLanguage: string;
  ttsVoiceId: string | null;
  ttsVoiceName: string | null; // e.g. "Male", "Female", or specific voice name
  ttsSpeed: number;
  ttsPitch: number;
  // Glove Calibration
  isCalibrated: boolean;
  lastCalibratedAt: string | null;
  flexMin: number[];
  flexMax: number[];
  imuOffsets: number[];
  isHydrating: boolean;
}

const initialState: SettingsState = {
  ttsLanguage: 'en-US',
  ttsVoiceId: null,
  ttsVoiceName: 'System Default',
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  isCalibrated: DEFAULT_CALIBRATION_PROFILE.isCalibrated,
  lastCalibratedAt: DEFAULT_CALIBRATION_PROFILE.lastCalibratedAt,
  flexMin: DEFAULT_CALIBRATION_PROFILE.flexMin,
  flexMax: DEFAULT_CALIBRATION_PROFILE.flexMax,
  imuOffsets: DEFAULT_CALIBRATION_PROFILE.imuOffsets,
  isHydrating: true,
};

// Async Thunk to load settings from storage
export const hydrateSettings = createAsyncThunk('settings/hydrate', async () => {
  const language = await AsyncStorage.getItem('ttsLanguage');
  const voiceId = await AsyncStorage.getItem('ttsVoiceId');
  const voiceName = await AsyncStorage.getItem('ttsVoiceName');
  const speedStr = await AsyncStorage.getItem('ttsSpeed');
  const pitchStr = await AsyncStorage.getItem('ttsPitch');
  const calibrationStr = await AsyncStorage.getItem('gloveCalibration');

  let calibration: CalibrationProfile = DEFAULT_CALIBRATION_PROFILE;
  if (calibrationStr) {
    try {
      calibration = JSON.parse(calibrationStr);
    } catch {
      // Use defaults if parse fails
    }
  }

  return {
    ttsLanguage: language || 'en-US',
    ttsVoiceId: voiceId || null,
    ttsVoiceName: voiceName || 'System Default',
    ttsSpeed: speedStr ? parseFloat(speedStr) : 1.0,
    ttsPitch: pitchStr ? parseFloat(pitchStr) : 1.0,
    isCalibrated: calibration.isCalibrated ?? false,
    lastCalibratedAt: calibration.lastCalibratedAt ?? null,
    flexMin: calibration.flexMin ?? DEFAULT_CALIBRATION_PROFILE.flexMin,
    flexMax: calibration.flexMax ?? DEFAULT_CALIBRATION_PROFILE.flexMax,
    imuOffsets: calibration.imuOffsets ?? DEFAULT_CALIBRATION_PROFILE.imuOffsets,
  };
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTtsLanguage: (state, action: PayloadAction<string>) => {
      state.ttsLanguage = action.payload;
      AsyncStorage.setItem('ttsLanguage', action.payload);
    },
    setTtsVoice: (state, action: PayloadAction<{ id: string | null, name: string }>) => {
      state.ttsVoiceId = action.payload.id;
      state.ttsVoiceName = action.payload.name;
      if (action.payload.id) {
        AsyncStorage.setItem('ttsVoiceId', action.payload.id);
      } else {
        AsyncStorage.removeItem('ttsVoiceId');
      }
      AsyncStorage.setItem('ttsVoiceName', action.payload.name);
    },
    setTtsSpeed: (state, action: PayloadAction<number>) => {
      state.ttsSpeed = action.payload;
      AsyncStorage.setItem('ttsSpeed', action.payload.toString());
    },
    setTtsPitch: (state, action: PayloadAction<number>) => {
      state.ttsPitch = action.payload;
      AsyncStorage.setItem('ttsPitch', action.payload.toString());
    },
    saveCalibrationProfile: (
      state,
      action: PayloadAction<{ flexMin: number[]; flexMax: number[]; imuOffsets: number[] }>
    ) => {
      state.flexMin = action.payload.flexMin;
      state.flexMax = action.payload.flexMax;
      state.imuOffsets = action.payload.imuOffsets;
      state.isCalibrated = true;
      state.lastCalibratedAt = new Date().toISOString();

      const profile: CalibrationProfile = {
        isCalibrated: true,
        lastCalibratedAt: state.lastCalibratedAt,
        flexMin: state.flexMin,
        flexMax: state.flexMax,
        imuOffsets: state.imuOffsets,
      };
      AsyncStorage.setItem('gloveCalibration', JSON.stringify(profile));
    },
    resetCalibration: (state) => {
      state.isCalibrated = false;
      state.lastCalibratedAt = null;
      state.flexMin = DEFAULT_CALIBRATION_PROFILE.flexMin;
      state.flexMax = DEFAULT_CALIBRATION_PROFILE.flexMax;
      state.imuOffsets = DEFAULT_CALIBRATION_PROFILE.imuOffsets;
      AsyncStorage.removeItem('gloveCalibration');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettings.fulfilled, (state, action) => {
      state.ttsLanguage = action.payload.ttsLanguage;
      state.ttsVoiceId = action.payload.ttsVoiceId;
      state.ttsVoiceName = action.payload.ttsVoiceName;
      state.ttsSpeed = action.payload.ttsSpeed;
      state.ttsPitch = action.payload.ttsPitch;
      state.isCalibrated = action.payload.isCalibrated;
      state.lastCalibratedAt = action.payload.lastCalibratedAt;
      state.flexMin = action.payload.flexMin;
      state.flexMax = action.payload.flexMax;
      state.imuOffsets = action.payload.imuOffsets;
      state.isHydrating = false;
    });
  }
});

export const {
  setTtsLanguage,
  setTtsVoice,
  setTtsSpeed,
  setTtsPitch,
  saveCalibrationProfile,
  resetCalibration,
} = settingsSlice.actions;

export default settingsSlice.reducer;

