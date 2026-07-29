import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../api/services/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
  isHydrating: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  hasSeenOnboarding: false,
  isHydrating: true,
};

// Async Thunks
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const token = await AsyncStorage.getItem('userToken');
  const refreshToken = await AsyncStorage.getItem('userRefreshToken');
  const userStr = await AsyncStorage.getItem('userData');
  const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
  
  return {
    token,
    refreshToken,
    user: userStr ? JSON.parse(userStr) : null,
    hasSeenOnboarding: hasSeenOnboarding === 'true',
  };
});

export const setHasSeenOnboarding = createAsyncThunk('auth/setOnboarding', async () => {
  await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  return true;
});

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    
    if (data.access_token) {
        await AsyncStorage.setItem('userToken', data.access_token);
        // Map access_token to token for backwards compatibility in UI state if needed
        data.token = data.access_token;
    } else if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
    }

    if (data.refresh_token) {
        await AsyncStorage.setItem('userRefreshToken', data.refresh_token);
    }
    
    if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
    }
    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userRefreshToken');
  await AsyncStorage.removeItem('userData');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Hydrate
    builder.addCase(hydrateAuth.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.token;
      state.hasSeenOnboarding = action.payload.hasSeenOnboarding;
      state.isHydrating = false;
    });
    // Set Onboarding
    builder.addCase(setHasSeenOnboarding.fulfilled, (state) => {
      state.hasSeenOnboarding = true;
    });
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token || action.payload.access_token;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
