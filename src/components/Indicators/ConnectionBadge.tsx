import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { themeConstants } from '../../theme/themeConstants';

interface ConnectionBadgeProps {
  status: 'Connected' | 'Disconnected' | 'Connecting';
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ status }) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch(status) {
      case 'Connected': return '#34C759'; // Success green
      case 'Disconnected': return theme.colors.error;
      case 'Connecting': return theme.colors.primary;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeConstants.spacing.s,
    paddingVertical: themeConstants.spacing.xs,
    borderRadius: themeConstants.radii.round,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.xs,
  },
});
