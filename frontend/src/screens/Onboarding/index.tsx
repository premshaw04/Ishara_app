import React from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { setHasSeenOnboarding } from '../../store/slices/authSlice';
import { PrimaryButton, SectionTitle } from '../../components';;
import { AuthStackScreenProps } from '../../navigation/types';

export const OnboardingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'Onboarding'>['navigation']>();
  const dispatch = useDispatch<AppDispatch>();

  const handleGetStarted = async () => {
    await dispatch(setHasSeenOnboarding());
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <SectionTitle title="Welcome to Ishara" style={styles.title} />
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Bridging Silence, Connecting Lives. AI-powered sign language translation using the ESP32 Smart Glove.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Get Started" onPress={handleGetStarted} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeConstants.spacing.xl,
  },
  title: {
    fontSize: themeConstants.typography.size.xxl,
    textAlign: 'center',
    color: themeConstants.palette.primary,
  },
  subtitle: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.m,
    textAlign: 'center',
    marginTop: themeConstants.spacing.m,
    lineHeight: 24,
  },
  footer: {
    padding: themeConstants.spacing.l,
    paddingBottom: themeConstants.spacing.xxl,
  },
});
