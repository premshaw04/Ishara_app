import React from 'react';
import { Provider as StoreProvider, useSelector } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './store';
import { lightTheme, darkTheme } from './theme';
import { AppNavigator } from './navigation';
import { useColorScheme } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toast } from './components';
import { ErrorBoundary } from './components/Layout/ErrorBoundary';

const MainApp = () => {
  const systemColorScheme = useColorScheme();
  const reduxIsDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  
  // Use Redux preference if set, otherwise fallback to system
  const isDark = reduxIsDarkMode ?? (systemColorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
      <Toast />
    </GestureHandlerRootView>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MainApp />
        </PersistGate>
      </StoreProvider>
    </ErrorBoundary>
  );
};
