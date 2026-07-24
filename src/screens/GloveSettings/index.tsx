import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components';
import { themeConstants } from '../../theme/themeConstants';

export const GloveSettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [autoConnect, setAutoConnect] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header title="Glove Settings" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Connected Device */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="hardware-chip-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: theme.colors.onBackground }]}>Connected Device</Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>ESP32 Smart Glove</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: themeConstants.palette.success }]} />
                <Text style={[styles.statusText, { color: themeConstants.palette.success }]}>Connected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Calibrate Glove */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="options-outline" size={24} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: theme.colors.onBackground }]}>Calibrate Glove</Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>Calibrate sensors for better accuracy.</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.actionButton, { borderColor: theme.colors.primary }]}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Calibrate</Text>
          </TouchableOpacity>
        </View>

        {/* Sensitivity */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.settingLabel, { color: theme.colors.onBackground }]}>Sensitivity</Text>
            <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>Medium</Text>
          </View>
          {/* Dummy Slider UI */}
          <View style={styles.sliderContainer}>
            <View style={[styles.sliderTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: '50%' }]} />
            </View>
            <View style={[styles.sliderThumb, { backgroundColor: theme.colors.primary, left: '50%' }]} />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Data Frequency */}
        <TouchableOpacity style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.onBackground }]}>Data Frequency</Text>
          <Ionicons name="chevron-down-outline" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Divider style={styles.divider} />

        {/* Auto Connect */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.onBackground }]}>Auto Connect</Text>
          <Switch 
            value={autoConnect} 
            onValueChange={setAutoConnect} 
            color={theme.colors.primary} 
          />
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: themeConstants.spacing.m,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: themeConstants.radii.l,
    padding: themeConstants.spacing.m,
    marginBottom: themeConstants.spacing.m,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: themeConstants.spacing.m,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.semibold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: themeConstants.typography.size.xs,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: themeConstants.radii.m,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: themeConstants.spacing.m,
  },
  actionButtonText: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: themeConstants.spacing.l,
  },
  settingLabel: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  settingValue: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
  },
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: themeConstants.spacing.s,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 2,
    marginLeft: -8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: themeConstants.spacing.m,
  },
  divider: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  bottomPadding: {
    height: 40,
  }
});

