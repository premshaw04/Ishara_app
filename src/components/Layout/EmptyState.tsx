import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { themeConstants } from '../../theme/themeConstants';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'inbox-outline', 
  title, 
  description 
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Icon name={icon as any} size={64} color={theme.colors.onSurfaceVariant} />
      </View>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeConstants.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.l,
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.semibold,
    fontSize: themeConstants.typography.size.xl,
    marginBottom: themeConstants.spacing.s,
    textAlign: 'center',
  },
  description: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.m,
    textAlign: 'center',
  },
});
