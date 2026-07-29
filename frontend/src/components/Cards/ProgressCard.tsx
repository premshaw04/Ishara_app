import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressBar, useTheme } from 'react-native-paper';
import { BaseCard } from './BaseCard';
import { themeConstants } from '../../theme/themeConstants';

interface ProgressCardProps {
  title: string;
  percentage: number; // 0 to 100
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ title, percentage }) => {
  const theme = useTheme();

  return (
    <BaseCard style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
        <Text style={[styles.percentage, { color: theme.colors.onSurface }]}>{percentage}%</Text>
      </View>
      <ProgressBar 
        progress={percentage / 100} 
        color={theme.colors.primary} 
        style={styles.progressBar} 
      />
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: themeConstants.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: themeConstants.spacing.m,
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
    textTransform: 'uppercase',
  },
  percentage: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.xl,
  },
  progressBar: {
    height: 8,
    borderRadius: themeConstants.radii.round,
  }
});
