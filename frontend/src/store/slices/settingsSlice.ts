import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsState {
  ttsLanguage: string;
  ttsVoiceId: string | null;
  ttsVoiceName: string | null; // e.g. "Male", "Female", or specific voice name
  ttsSpeed: number;
  ttsPitch: number;
  isHydrating: boolean;
}

const initialState: SettingsState = {
  ttsLanguage: 'en-US',
  ttsVoiceId: null,
  ttsVoiceName: 'System Default',
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  isHydrating: true,
};

// Async Thunk to load settings from storage
export const hydrateSettings = createAsyncThunk('settings/hydrate', async () => {
  const language = await AsyncStorage.getItem('ttsLanguage');
  const voiceId = await AsyncStorage.getItem('ttsVoiceId');
  const voiceName = await AsyncStorage.getItem('ttsVoiceName');
  const speedStr = await AsyncStorage.getItem('ttsSpeed');
  const pitchStr = await AsyncStorage.getItem('ttsPitch');

  return {
    ttsLanguage: language || 'en-US',
    ttsVoiceId: voiceId || null,
    ttsVoiceName: voiceName || 'System Default',
    ttsSpeed: speedStr ? parseFloat(speedStr) : 1.0,
    ttsPitch: pitchStr ? parseFloat(pitchStr) : 1.0,
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
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettings.fulfilled, (state, action) => {
      state.ttsLanguage = action.payload.ttsLanguage;
      state.ttsVoiceId = action.payload.ttsVoiceId;
      state.ttsVoiceName = action.payload.ttsVoiceName;
      state.ttsSpeed = action.payload.ttsSpeed;
      state.ttsPitch = action.payload.ttsPitch;
      state.isHydrating = false;
    });
  }
});

export const { setTtsLanguage, setTtsVoice, setTtsSpeed, setTtsPitch } = settingsSlice.actions;

export default settingsSlice.reducer;
