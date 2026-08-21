import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { saveCalibrationProfile } from '../../store/slices/settingsSlice';
import { Header, PrimaryButton, OutlinedButton, BaseCard } from '../../components';
import { themeConstants } from '../../theme/themeConstants';
import {
  FINGER_NAMES,
  normalizeFlexValue,
  DEFAULT_CALIBRATION_PROFILE,
} from '../../utils/calibration';

type CalibrationStep = 'WELCOME' | 'STEP_OPEN' | 'STEP_FIST' | 'STEP_TEST' | 'STEP_COMPLETE';

const { width } = Dimensions.get('window');

export const CalibrationScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const liveFlexSensors = useSelector((state: RootState) => state.sensor.flexSensors);
  const connectionStatus = useSelector((state: RootState) => state.sensor.status);
  const savedFlexMin = useSelector((state: RootState) => state.settings.flexMin);
  const savedFlexMax = useSelector((state: RootState) => state.settings.flexMax);
  const isAlreadyCalibrated = useSelector((state: RootState) => state.settings.isCalibrated);

  // Local Calibration State
  const [step, setStep] = useState<CalibrationStep>('WELCOME');
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Buffer to accumulate readings during 3-second sampling window for smooth average
  const openSamplesRef = useRef<number[][]>([]);
  const fistSamplesRef = useRef<number[][]>([]);

  // Captured baselines
  const [capturedMin, setCapturedMin] = useState<number[]>([...savedFlexMin]);
  const [capturedMax, setCapturedMax] = useState<number[]>([...savedFlexMax]);

  // Demo fallback values if hardware is disconnected
  const [simulatedValues, setSimulatedValues] = useState<number[]>([2800, 2900, 2750, 2850, 2400]);

  // Current active readings (live from hardware or simulated)
  const isConnected = connectionStatus === 'connected';
  const currentRawFlex = isConnected && liveFlexSensors && liveFlexSensors.length === 5
    ? liveFlexSensors
    : simulatedValues;

  // Record samples in buffer when sampling is active
  useEffect(() => {
    if (isCountingDown) {
      if (step === 'STEP_OPEN') {
        openSamplesRef.current.push([...currentRawFlex]);
      } else if (step === 'STEP_FIST') {
        fistSamplesRef.current.push([...currentRawFlex]);
      }
    }
  }, [currentRawFlex, isCountingDown, step]);

  // Handle countdown timer for sampling
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);

      if (step === 'STEP_OPEN') {
        // Compute average of all captured open samples
        const averages = computeAverages(openSamplesRef.current, currentRawFlex);
        setCapturedMin(averages);
        setStep('STEP_FIST');
      } else if (step === 'STEP_FIST') {
        // Compute average of all captured fist samples
        const averages = computeAverages(fistSamplesRef.current, currentRawFlex);
        setCapturedMax(averages);
        setStep('STEP_TEST');
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCountingDown, countdown, step, currentRawFlex]);

  const computeAverages = (samples: number[][], fallback: number[]): number[] => {
    if (samples.length === 0) return fallback;
    const sums = [0, 0, 0, 0, 0];
    samples.forEach((sample) => {
      sample.forEach((val, idx) => {
        sums[idx] += val;
      });
    });
    return sums.map((s) => Math.round(s / samples.length));
  };

  // Start Step 1: Open Hand
  const handleStartOpenHand = () => {
    openSamplesRef.current = [];
    setCountdown(3);
    setStep('STEP_OPEN');
    setIsCountingDown(true);
  };

  // Start Step 2: Closed Fist
  const handleStartFist = () => {
    fistSamplesRef.current = [];
    setCountdown(3);
    setIsCountingDown(true);
  };

  // Save Calibration
  const handleSave = () => {
    dispatch(
      saveCalibrationProfile({
        flexMin: capturedMin,
        flexMax: capturedMax,
      })
    );
    setStep('STEP_COMPLETE');
  };

  // Restart / Redo
  const handleRestart = () => {
    setCapturedMin([...DEFAULT_CALIBRATION_PROFILE.flexMin]);
    setCapturedMax([...DEFAULT_CALIBRATION_PROFILE.flexMax]);
    setStep('WELCOME');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header title="Calibrate Glove" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator Header */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepNodesRow}>
            {['Start', 'Open Hand', 'Fist', 'Test', 'Done'].map((label, idx) => {
              const stepIndex = ['WELCOME', 'STEP_OPEN', 'STEP_FIST', 'STEP_TEST', 'STEP_COMPLETE'].indexOf(step);
              const isActive = idx === stepIndex;
              const isPast = idx < stepIndex;

              return (
                <View key={idx} style={styles.stepNodeItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : isPast
                          ? themeConstants.palette.success
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    {isPast ? (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumberText,
                          { color: isActive ? '#FFF' : theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isActive
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Connection Notice */}
        {!isConnected && (
          <View style={styles.noticeBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#FF9800" />
            <Text style={styles.noticeText}>
              Glove is in Simulation Mode (connect via WiFi/Bluetooth for live hardware calibration).
            </Text>
          </View>
        )}

        {/* ============================================================ */}
        {/* SCREEN 1: WELCOME */}
        {/* ============================================================ */}
        {step === 'WELCOME' && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(98, 0, 238, 0.1)' }]}>
              <MaterialCommunityIcons name="hand-wave-outline" size={48} color={theme.colors.primary} />
            </View>

            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              App-Guided Calibration
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
              Every hand size and glove fitting is unique. This 3-step wizard maps your finger bend
              angles so the AI can recognize your signs with maximum accuracy.
            </Text>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color={themeConstants.palette.success} />
                <Text style={styles.infoText}>Step 1: Record Open Hand Baseline</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color={themeConstants.palette.success} />
                <Text style={styles.infoText}>Step 2: Record Closed Fist Baseline</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color={themeConstants.palette.success} />
                <Text style={styles.infoText}>Step 3: Live Verification & Visual Feedback</Text>
              </View>
            </View>

            {isAlreadyCalibrated && (
              <View style={styles.calibratedBadge}>
                <Ionicons name="shield-checkmark" size={16} color={themeConstants.palette.success} />
                <Text style={styles.calibratedBadgeText}>Glove is currently calibrated</Text>
              </View>
            )}

            <PrimaryButton
              title="Start Calibration"
              onPress={handleStartOpenHand}
              style={styles.primaryBtn}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: STEP 1 - OPEN HAND */}
        {/* ============================================================ */}
        {step === 'STEP_OPEN' && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <MaterialCommunityIcons name="hand-back-right-outline" size={54} color="#2196F3" />
            </View>

            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              Step 1: Open Hand Flat
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
              Stretch all 5 fingers straight and flat. Keep your hand completely still while we record the baseline.
            </Text>

            {/* Countdown Display */}
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownNumber, { color: theme.colors.primary }]}>
                {countdown}
              </Text>
              <Text style={[styles.countdownLabel, { color: theme.colors.onSurfaceVariant }]}>
                Sampling sensor data...
              </Text>
            </View>

            {/* Live ADC Values Preview */}
            <View style={styles.rawValuesContainer}>
              <Text style={styles.rawHeader}>Live Sensor Readings (ADC):</Text>
              <View style={styles.rawValuesGrid}>
                {currentRawFlex.map((val, idx) => (
                  <View key={idx} style={styles.rawBadge}>
                    <Text style={styles.rawBadgeLabel}>{FINGER_NAMES[idx]}</Text>
                    <Text style={styles.rawBadgeVal}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: STEP 2 - CLOSED FIST */}
        {/* ============================================================ */}
        {step === 'STEP_FIST' && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(233, 30, 99, 0.1)' }]}>
              <MaterialCommunityIcons name="hand-back-left" size={54} color="#E91E63" />
            </View>

            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              Step 2: Close Into a Fist
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
              Curl all 5 fingers tightly into a fist. Hold the position and tap the button below to sample.
            </Text>

            {isCountingDown ? (
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownNumber, { color: '#E91E63' }]}>
                  {countdown}
                </Text>
                <Text style={[styles.countdownLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Recording fist bend baseline...
                </Text>
              </View>
            ) : (
              <PrimaryButton
                title="Hold Fist & Capture"
                onPress={handleStartFist}
                style={styles.primaryBtn}
              />
            )}

            {/* Live ADC Values Preview */}
            <View style={styles.rawValuesContainer}>
              <Text style={styles.rawHeader}>Live Sensor Readings (ADC):</Text>
              <View style={styles.rawValuesGrid}>
                {currentRawFlex.map((val, idx) => (
                  <View key={idx} style={styles.rawBadge}>
                    <Text style={styles.rawBadgeLabel}>{FINGER_NAMES[idx]}</Text>
                    <Text style={styles.rawBadgeVal}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* SCREEN 4: STEP 3 - LIVE TEST & VERIFICATION */}
        {/* ============================================================ */}
        {step === 'STEP_TEST' && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <Ionicons name="speedometer-outline" size={48} color={themeConstants.palette.success} />
            </View>

            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              Step 3: Test Your Calibration
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
              Move your fingers freely! Verify each finger bar moves smoothly from 0% (straight) to 100% (bent).
            </Text>

            {/* Live Visual Bars for all 5 fingers */}
            <View style={styles.barsCard}>
              {currentRawFlex.map((rawVal, idx) => {
                const min = capturedMin[idx];
                const max = capturedMax[idx];
                const pct = normalizeFlexValue(rawVal, min, max);

                return (
                  <View key={idx} style={styles.fingerBarRow}>
                    <View style={styles.fingerBarInfo}>
                      <Text style={[styles.fingerBarName, { color: theme.colors.onBackground }]}>
                        {FINGER_NAMES[idx]}
                      </Text>
                      <Text style={[styles.fingerBarPct, { color: theme.colors.primary }]}>
                        {pct}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={pct / 100}
                      color={pct > 75 ? '#E91E63' : pct > 35 ? theme.colors.primary : '#2196F3'}
                      style={styles.progressBar}
                    />
                    <View style={styles.thresholdInfo}>
                      <Text style={styles.thresholdText}>Min: {min}</Text>
                      <Text style={styles.thresholdText}>Raw: {rawVal}</Text>
                      <Text style={styles.thresholdText}>Max: {max}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <PrimaryButton
              title="Save & Apply Calibration"
              onPress={handleSave}
              style={styles.primaryBtn}
            />

            <OutlinedButton
              title="Recalibrate / Start Over"
              onPress={handleRestart}
              style={styles.secondaryBtn}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* SCREEN 5: STEP 4 - COMPLETE */}
        {/* ============================================================ */}
        {step === 'STEP_COMPLETE' && (
          <View style={styles.stepCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <Ionicons name="checkmark-circle" size={64} color={themeConstants.palette.success} />
            </View>

            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              Calibration Complete!
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
              Your custom glove profile has been saved. The app will now automatically normalize all
              real-time signs based on your exact hand dimensions.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Calibrated Finger Ranges</Text>
              {FINGER_NAMES.map((name, idx) => (
                <View key={idx} style={styles.summaryRow}>
                  <Text style={styles.summaryFinger}>{name}</Text>
                  <Text style={styles.summaryValues}>
                    {capturedMin[idx]} (Flat) → {capturedMax[idx]} (Fist)
                  </Text>
                </View>
              ))}
            </View>

            <PrimaryButton
              title="Done & Return to Settings"
              onPress={() => navigation.goBack()}
              style={styles.primaryBtn}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  stepperContainer: {
    marginBottom: themeConstants.spacing.m,
    paddingVertical: themeConstants.spacing.s,
  },
  stepNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNodeItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: themeConstants.spacing.m,
  },
  noticeText: {
    fontSize: 11,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: themeConstants.radii.l,
    padding: themeConstants.spacing.l,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.m,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: themeConstants.spacing.l,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: themeConstants.radii.m,
    padding: themeConstants.spacing.m,
    marginBottom: themeConstants.spacing.l,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 10,
    color: '#333',
    fontWeight: '500',
  },
  calibratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: themeConstants.spacing.m,
  },
  calibratedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: themeConstants.palette.success,
    marginLeft: 6,
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: themeConstants.spacing.m,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: '900',
    lineHeight: 70,
  },
  countdownLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  rawValuesContainer: {
    width: '100%',
    marginTop: themeConstants.spacing.m,
    backgroundColor: '#F5F5F7',
    padding: themeConstants.spacing.m,
    borderRadius: themeConstants.radii.m,
  },
  rawHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  rawValuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rawBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 50,
  },
  rawBadgeLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  rawBadgeVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  barsCard: {
    width: '100%',
    marginVertical: themeConstants.spacing.m,
  },
  fingerBarRow: {
    marginBottom: themeConstants.spacing.m,
  },
  fingerBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fingerBarName: {
    fontSize: 13,
    fontWeight: '600',
  },
  fingerBarPct: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  thresholdInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  thresholdText: {
    fontSize: 10,
    color: '#999',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: themeConstants.radii.m,
    padding: themeConstants.spacing.m,
    marginVertical: themeConstants.spacing.m,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  summaryFinger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  summaryValues: {
    fontSize: 12,
    color: '#666',
  },
  primaryBtn: {
    width: '100%',
    marginTop: themeConstants.spacing.s,
  },
  secondaryBtn: {
    width: '100%',
    marginTop: themeConstants.spacing.s,
  },
  bottomSpacer: {
    height: 40,
  },
});
