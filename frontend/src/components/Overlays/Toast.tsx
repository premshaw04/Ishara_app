import React from 'react';
import ToastMessage, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

export const Toast: React.FC = () => {
  const theme = useTheme();

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#34C759', backgroundColor: theme.colors.surface }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontFamily: themeConstants.typography.fontFamily.semibold,
          fontSize: themeConstants.typography.size.m,
          color: theme.colors.onSurface
        }}
        text2Style={{
          fontFamily: themeConstants.typography.fontFamily.regular,
          fontSize: themeConstants.typography.size.s,
          color: theme.colors.onSurfaceVariant
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: theme.colors.error, backgroundColor: theme.colors.surface }}
        text1Style={{
          fontFamily: themeConstants.typography.fontFamily.semibold,
          fontSize: themeConstants.typography.size.m,
          color: theme.colors.onSurface
        }}
        text2Style={{
          fontFamily: themeConstants.typography.fontFamily.regular,
          fontSize: themeConstants.typography.size.s,
          color: theme.colors.onSurfaceVariant
        }}
      />
    ),
  };

  return <ToastMessage config={toastConfig} />;
};

// Expose a quick utility method for usage anywhere
export const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
  ToastMessage.show({
    type: type,
    text1: title,
    text2: message,
    position: 'bottom',
    bottomOffset: 80,
  });
};
