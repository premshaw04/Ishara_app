import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isDarkMode: boolean;
  gloveConnected: boolean;
}

const initialState: AppState = {
  isDarkMode: false,
  gloveConnected: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setGloveConnection: (state, action: PayloadAction<boolean>) => {
      state.gloveConnected = action.payload;
    },
  },
});

export const { toggleTheme, setGloveConnection } = appSlice.actions;
export default appSlice.reducer;
