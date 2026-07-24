import { ms } from 'react-native-size-matters';

export const spacing = {
  xs: ms(4),
  s: ms(8),
  m: ms(16),
  l: ms(24),
  xl: ms(32),
  xxl: ms(40),
  xxxl: ms(48),
};

export const radii = {
  s: ms(4),
  m: ms(8),
  l: ms(16),   // Typical rounded card
  xl: ms(24),  // Very rounded elements (e.g. bottom sheets)
  round: ms(999), // Pills/Circles
};
