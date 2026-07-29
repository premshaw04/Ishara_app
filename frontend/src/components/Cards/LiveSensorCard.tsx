import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProgressBar, useTheme } from 'react-native-paper';
import { BaseCard } from './BaseCard';
import { themeConstants } from '../../theme/themeConstants';

interface LiveSensorCardProps {
  sensors: { label: string; value: number; progress: number }[];
}

export const LiveSensorCard: React.FC<LiveSensorCardProps> = React.memo(({ sensors }) => {
  const theme = useTheme();

  return (
    <BaseCard style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Live Sensor Data</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Updated just now</Text>
      </View>
      <View style={styles.listContainer}>
        {sensors.map((sensor, index) => (
          <View key={index} style={styles.sensorRow}>
            <Text style={[styles.sensorLabel, { color: theme.colors.onSurfaceVariant }]}>
              {sensor.label}
            </Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={sensor.progress}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
            <Text style={[styles.sensorValue, { color: theme.colors.onSurface }]}>
              {sensor.value}
            </Text>
          </View>
        ))}
      </View>
    </BaseCard>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: themeConstants.spacing.l,
  },
  headerRow: {
    marginBottom: themeConstants.spacing.m,
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
  listContainer: {
    gap: themeConstants.spacing.s,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sensorLabel: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
    width: 50,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: themeConstants.spacing.m,
  },
  progressBar: {
    height: 6,
    borderRadius: themeConstants.radii.round,
    backgroundColor: '#E3EFFF', // very light blue as per design
  },
  sensorValue: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.s,
    width: 24,
    textAlign: 'right',
  },
});
