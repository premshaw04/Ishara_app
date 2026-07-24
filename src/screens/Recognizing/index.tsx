import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { startWsRecognition, stopWsRecognition } from '../../store/middleware/websocketMiddleware';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  withDelay
} from 'react-native-reanimated';

import { BaseCard } from '../../components/Cards/BaseCard';
import { OutlinedButton } from '../../components/Buttons/OutlinedButton';
import { PrimaryButton } from '../../components/Buttons/PrimaryButton';
import { themeConstants } from '../../theme/themeConstants';

const { width } = Dimensions.get('window');

const WaveformBar = ({ index, isRecognizing, primaryColor }: { index: number, isRecognizing: boolean, primaryColor: string }) => {
  const height = useSharedValue(5);
  
  useEffect(() => {
    if (isRecognizing) {
      height.value = withDelay(
        index * 50,
        withRepeat(
          withSequence(
            withTiming(Math.random() * 30 + 10, { duration: 200 + Math.random() * 200 }),
            withTiming(5, { duration: 200 + Math.random() * 200 })
          ),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(5, { duration: 300 });
    }
  }, [isRecognizing, index]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={[styles.waveformBar, { backgroundColor: primaryColor }, style]} />
  );
};

const Dot = ({ index, isRecognizing, primaryColor }: { index: number, isRecognizing: boolean, primaryColor: string }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecognizing) {
      opacity.value = withDelay(
        index * 300,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.3, { duration: 300 })
          ),
          -1,
          true
        )
      );
    } else {
      opacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isRecognizing, index]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: primaryColor }, style]} />
  );
};

export const RecognizingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [isRecognizing, setIsRecognizing] = useState(false);
  const prediction = useSelector((state: RootState) => state.sensor.prediction);
  
  useEffect(() => {
    // Start recognition automatically on mount
    toggleRecognition();
    return () => {
      // Stop when leaving
      dispatch(stopWsRecognition());
    };
  }, []);

  // Rotate animation for the scanner ring
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    if (isRecognizing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isRecognizing]);

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    };
  });

  const toggleRecognition = () => {
    if (isRecognizing) {
      dispatch(stopWsRecognition());
      setIsRecognizing(false);
    } else {
      dispatch(startWsRecognition());
      setIsRecognizing(true);
    }
  };

  const confidenceValue = isRecognizing ? (prediction?.confidence || 0) : 0;
  const detectedSign = isRecognizing ? (prediction?.sign || 'WAITING...') : '- - -';

  // Dummy waveform data
  const waveformBars = Array.from({ length: 30 }).map((_, i) => i);
  const dots = [0, 1, 2];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {isRecognizing ? 'Recognizing...' : 'Paused'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Top Section - 3D Glove & Scanner */}
        <View style={styles.gloveSection}>
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.scannerRing, { borderColor: theme.colors.primary }, animatedRingStyle]} />
            <View style={[styles.innerCircle, { backgroundColor: theme.colors.surface }]}>
              {/* Dummy 3D Glove Image */}
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1000/1000889.png' }}
                style={styles.gloveImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
              {isRecognizing ? 'Keep your hand steady' : 'Ready to start'}
            </Text>
            <View style={styles.dotsContainer}>
              {dots.map(dot => (
                <Dot key={dot} index={dot} isRecognizing={isRecognizing} primaryColor={theme.colors.primary} />
              ))}
            </View>
          </View>
        </View>

        {/* Confidence Card */}
        <BaseCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Confidence</Text>
          <Text style={[styles.confidenceValue, { color: theme.colors.onSurface }]}>{confidenceValue}%</Text>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={[styles.progressBarFill, { backgroundColor: theme.colors.primary, width: `${confidenceValue}%` }]} />
          </View>
        </BaseCard>

        {/* Detected Sign Card */}
        <BaseCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Detected Sign</Text>
          <Text style={[styles.detectedSignText, { color: theme.colors.primary }]}>{detectedSign}</Text>
          <View style={styles.waveformContainer}>
            {waveformBars.map((bar) => (
              <WaveformBar key={bar} index={bar} isRecognizing={isRecognizing} primaryColor={theme.colors.primary} />
            ))}
          </View>
        </BaseCard>

      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footerContainer}>
        {isRecognizing ? (
          <OutlinedButton 
            title="Stop Recognition" 
            icon="stop" 
            onPress={toggleRecognition}
            style={styles.actionButton}
          />
        ) : (
          <PrimaryButton 
            title="Start Recognition" 
            icon="waveform" 
            onPress={toggleRecognition}
            style={styles.actionButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeConstants.spacing.m,
    paddingVertical: themeConstants.spacing.m,
  },
  backButton: {
    padding: themeConstants.spacing.xs,
  },
  headerTitle: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.l,
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: themeConstants.spacing.l,
    justifyContent: 'space-around', // Allow elements to spread vertically
    paddingBottom: themeConstants.spacing.l, // add bottom padding to prevent touching footer
  },
  gloveSection: {
    alignItems: 'center',
    marginVertical: themeConstants.spacing.l,
  },
  circleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  gloveImage: {
    width: 120,
    height: 120,
  },
  statusTextContainer: {
    marginTop: themeConstants.spacing.l,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
    marginBottom: themeConstants.spacing.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  card: {
    padding: themeConstants.spacing.l,
    marginBottom: themeConstants.spacing.m,
  },
  cardTitle: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
    marginBottom: themeConstants.spacing.s,
  },
  confidenceValue: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.xxxl,
    marginBottom: themeConstants.spacing.m,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detectedSignText: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: 32, // larger size
    textAlign: 'center',
    marginVertical: themeConstants.spacing.m,
    textTransform: 'uppercase',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    paddingHorizontal: themeConstants.spacing.m,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  footerContainer: {
    padding: themeConstants.spacing.l,
    paddingBottom: themeConstants.spacing.xxl,
  },
  actionButton: {
    borderRadius: themeConstants.radii.round,
    paddingVertical: themeConstants.spacing.xs,
  }
});
