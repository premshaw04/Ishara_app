import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { themeConstants } from '../../theme/themeConstants';

interface DeviceCardProps {
  name: string;
  status: 'Connected' | 'Disconnected' | 'Connecting';
  onPress?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ name, status, onPress }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch(status) {
      case 'Connected': return theme.colors.error ? '#34C759' : '#34C759'; // Success green
      case 'Disconnected': return theme.colors.error;
      case 'Connecting': return theme.colors.primary;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <BaseCard style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon name="bluetooth" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </BaseCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: themeConstants.spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: themeConstants.radii.round,
    backgroundColor: 'rgba(24, 119, 242, 0.1)', // Light primary
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: themeConstants.spacing.m,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontFamily: themeConstants.typography.fontFamily.semibold,
    fontSize: themeConstants.typography.size.m,
    marginBottom: themeConstants.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
});
