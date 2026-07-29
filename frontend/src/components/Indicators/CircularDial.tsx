import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface CircularDialProps {
  value: number; // The actual value
  max?: number;  // The maximum expected value (absolute value for range calculation)
  label: string; // E.g., 'Pitch', 'Roll', 'Yaw'
  unit?: string; // E.g., '°'
  size?: number; // Diameter of the circle
  strokeWidth?: number;
}

export const CircularDial: React.FC<CircularDialProps> = ({
  value,
  max = 90,
  label,
  unit = '°',
  size = 72,
  strokeWidth = 6,
}) => {
  const theme = useTheme();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Normalize value to a percentage (0 to 1) relative to the max absolute value
  const normalizedValue = Math.min(Math.abs(value) / max, 1);
  const strokeDashoffset = circumference - normalizedValue * circumference;

  return (
    <View style={[styles.container, { width: size, height: size + 24 }]}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <Circle
            stroke={theme.colors.surfaceVariant}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <Circle
            stroke={theme.colors.primary}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={[styles.valueText, { color: theme.colors.onSurface }]}>
            {value}{unit}
          </Text>
        </View>
      </View>
      <Text style={[styles.labelText, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.m,
  },
  labelText: {
    marginTop: themeConstants.spacing.xs,
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
});
