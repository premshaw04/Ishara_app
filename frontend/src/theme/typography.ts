import { ms } from 'react-native-size-matters';

export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System', // Replace with custom font like 'Inter-Regular' if added
    medium: 'System',  // Replace with 'Inter-Medium'
    semibold: 'System', // Replace with 'Inter-SemiBold'
    bold: 'System',    // Replace with 'Inter-Bold'
  },
  
  // Responsive Font Sizes (ms = moderateScale, scales based on device width)
  size: {
    xs: ms(10),
    s: ms(12),
    m: ms(14),
    l: ms(16),
    xl: ms(20),
    xxl: ms(24),
    xxxl: ms(32),
  },

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
