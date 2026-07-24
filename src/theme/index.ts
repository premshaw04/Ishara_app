import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { palette, lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, radii } from './spacing';
import { shadows } from './shadows';

export * from './themeConstants';

// React Native Paper theme integration
const fontConfig = {
  fontFamily: typography.fontFamily.regular,
} as const;

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    primaryContainer: lightColors.primaryContainer,
    onPrimary: lightColors.onPrimary,
    
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    
    onSurface: lightColors.text,
    onSurfaceVariant: lightColors.textSecondary,
    
    error: lightColors.error,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: lightColors.surfaceVariant, // Example mapping
    }
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryContainer,
    onPrimary: darkColors.onPrimary,
    
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    
    onSurface: darkColors.text,
    onSurfaceVariant: darkColors.textSecondary,
    
    error: darkColors.error,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: darkColors.surfaceVariant,
    }
  },
};

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
