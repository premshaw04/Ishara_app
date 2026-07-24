import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressBar, useTheme } from 'react-native-paper';
import { BaseCard } from './BaseCard';
import { themeConstants } from '../../theme/themeConstants';

interface SensorCardProps {
  label: string;
  value: number; // 0 to 100 or mapped appropriately
  progress: number; // 0.0 to 1.0
}

export const SensorCard: React.FC<SensorCardProps> = ({ label, value, progress }) => {
  const theme = useTheme();

  return (
    <BaseCard style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
      </View>
      <ProgressBar 
        progress={progress} 
        color={theme.colors.primary} 
        style={styles.progressBar} 
      />
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: themeConstants.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.s,
  },
  label: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
  },
  value: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.m,
  },
  progressBar: {
    height: 6,
    borderRadius: themeConstants.radii.round,
  }
});
