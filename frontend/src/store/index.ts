import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import sensorReducer from './slices/sensorSlice';
import settingsReducer from './slices/settingsSlice';
import { websocketMiddleware } from './middleware/websocketMiddleware';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['app', 'auth', 'settings'], // Persist these slices
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  sensor: sensorReducer, // Don't persist live sensor data
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(websocketMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
