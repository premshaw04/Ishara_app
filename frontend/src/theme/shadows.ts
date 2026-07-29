import { Platform } from 'react-native';
import { palette } from './colors';

const generateShadow = (elevation: number, opacity: number = 0.1) => {
  return Platform.select({
    ios: {
      shadowColor: palette.black,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: opacity,
      shadowRadius: elevation * 1.5,
    },
    android: {
      elevation: elevation * 1.5,
    },
    default: {
      shadowColor: palette.black,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: opacity,
      shadowRadius: elevation * 1.5,
      elevation: elevation * 1.5,
    }
  });
};

export const shadows = {
  none: generateShadow(0, 0),
  small: generateShadow(2, 0.05),
  medium: generateShadow(4, 0.1),
  large: generateShadow(8, 0.12),
  xlarge: generateShadow(12, 0.15),
};
