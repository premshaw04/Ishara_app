export const palette = {
  primary: '#1877F2', // Modern vibrant Blue
  primaryDark: '#0D5CB8',
  primaryLight: '#E3EFFF',
  
  secondary: '#FF9500', // Warning/Accent color
  success: '#34C759',
  error: '#FF3B30',
  
  // Neutral scales
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export const lightColors = {
  primary: palette.primary,
  primaryContainer: palette.primaryLight,
  onPrimary: palette.white,
  
  background: palette.gray50,
  surface: palette.white,
  surfaceVariant: palette.gray100,
  
  text: palette.gray900,
  textSecondary: palette.gray500,
  
  border: palette.gray200,
  
  error: palette.error,
  success: palette.success,
  warning: palette.secondary,
};

export const darkColors = {
  primary: palette.primary,
  primaryContainer: palette.primaryDark,
  onPrimary: palette.white,
  
  background: palette.gray900,
  surface: palette.gray800,
  surfaceVariant: palette.gray700,
  
  text: palette.gray50,
  textSecondary: palette.gray400,
  
  border: palette.gray700,
  
  error: palette.error,
  success: palette.success,
  warning: palette.secondary,
};
