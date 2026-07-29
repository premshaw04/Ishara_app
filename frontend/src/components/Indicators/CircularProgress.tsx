import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

// Note: For true circular progress bars with exact percentages, 
// a library like 'react-native-circular-progress-indicator' or Reanimated SVG is recommended.
// This is a placeholder spinner matching the design system.

interface CircularProgressProps {
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ size = 64 }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} size={size} color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
