import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { BaseCard } from './BaseCard';
import { CircularDial } from '../Indicators/CircularDial';
import { themeConstants } from '../../theme/themeConstants';

interface OrientationCardProps {
  pitch: number;
  roll: number;
  yaw: number;
}

export const OrientationCard: React.FC<OrientationCardProps> = ({ pitch, roll, yaw }) => {
  const theme = useTheme();

  return (
    <BaseCard style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Orientation (MPU6050)</Text>
      <View style={styles.dialsContainer}>
        <CircularDial value={pitch} max={90} label="Pitch" />
        <CircularDial value={roll} max={90} label="Roll" />
        <CircularDial value={yaw} max={180} label="Yaw" />
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: themeConstants.spacing.l,
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
    marginBottom: themeConstants.spacing.l,
  },
  dialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: themeConstants.spacing.s,
  },
});
