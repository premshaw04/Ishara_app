import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BaseCard } from './BaseCard';
import { themeConstants } from '../../theme/themeConstants';

export const GloveStatusCard: React.FC = React.memo(() => {
  const theme = useTheme();
  const status = useSelector((state: RootState) => state.sensor.status);

  let statusColor = themeConstants.palette.gray400;
  let statusText = 'Disconnected';
  let iconName: any = 'wifi-off';

  if (status === 'connected') {
    statusColor = themeConstants.palette.success;
    statusText = 'Connected';
    iconName = 'wifi';
  } else if (status === 'connecting' || status === 'reconnecting') {
    statusColor = themeConstants.palette.secondary;
    statusText = status === 'connecting' ? 'Connecting...' : 'Reconnecting...';
    iconName = 'wifi-sync';
  } else if (status === 'error') {
    statusColor = themeConstants.palette.error;
    statusText = 'Connection Error';
    iconName = 'wifi-alert';
  }

  return (
    <BaseCard style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Glove Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{statusText}</Text>
          </View>
        </View>
        <Icon name={iconName} size={24} color={statusColor} />
      </View>
      <View style={styles.imageContainer}>
        <Image 
          source={theme.dark ? require('../../assets/glove_dark.png') : require('../../assets/glove.png')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </BaseCard>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: themeConstants.spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
    marginBottom: 4,
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
  subtitle: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
  imageContainer: {
    marginTop: themeConstants.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140, // Expanded space for detailed glove graphics
  },
  image: {
    width: 160,
    height: 140,
  }
});
