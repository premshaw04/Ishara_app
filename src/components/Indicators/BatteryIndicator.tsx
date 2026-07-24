import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { themeConstants } from '../../theme/themeConstants';

interface BatteryIndicatorProps {
  level: number; // 0 to 100
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ level }) => {
  const theme = useTheme();

  const getBatteryIcon = () => {
    if (level > 90) return 'battery';
    if (level > 80) return 'battery-90';
    if (level > 60) return 'battery-70';
    if (level > 40) return 'battery-50';
    if (level > 20) return 'battery-30';
    if (level > 10) return 'battery-20';
    return 'battery-10';
  };

  const getColor = () => {
    if (level <= 20) return theme.colors.error;
    if (level <= 50) return '#FF9500'; // Warning orange
    return '#34C759'; // Success green
  };

  return (
    <View style={styles.container}>
      <Icon name={getBatteryIcon()} size={24} color={getColor()} />
      <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>{level}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 4,
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
});
