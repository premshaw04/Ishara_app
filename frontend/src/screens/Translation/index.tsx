import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, IconButton, Text as PaperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ttsService } from '../../services/ttsService';
import { Header } from '../../components/Layout/Header';
import { BaseCard } from '../../components/Cards/BaseCard';
import { PrimaryButton } from '../../components/Buttons/PrimaryButton';
import { OutlinedButton } from '../../components/Buttons/OutlinedButton';
import { themeConstants } from '../../theme/themeConstants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { connectWebSocket, disconnectWebSocket, startWsRecognition, stopWsRecognition } from '../../store/middleware/websocketMiddleware';

export const TranslationScreen = () => {
  const theme = useTheme();
  
  // Settings from Redux
  const settings = useSelector((state: RootState) => state.settings);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Clean up TTS when unmounting
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);
  
  const dispatch = useDispatch();
  
  // Real data from Backend via Redux Store
  const predictionData = useSelector((state: RootState) => state.sensor.prediction);
  const connectionStatus = useSelector((state: RootState) => state.sensor.status);

  useEffect(() => {
    // 1. Connect to the global backend socket when this screen opens
    dispatch(connectWebSocket());

    // 2. CLEANUP: Disconnect when the user leaves this screen
    // (Optional: You might want to keep it connected globally, but since you are testing this feature specifically, we disconnect on leave)
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch]);

  // Derive the text to show based on Redux state
  const detectedSign = predictionData?.sign || (connectionStatus === 'connected' ? "Connected! Waiting for sign..." : "Connecting to backend...");
  const speechOutput = predictionData?.sign || "Waiting for glove...";

  const [lastSpokenSign, setLastSpokenSign] = useState<string | null>(null);

  const handleSpeak = (textToSpeak?: string | any) => {
    const text = typeof textToSpeak === 'string' ? textToSpeak : speechOutput;
    console.log("🗣️ Triggering Speech for:", text);
    
    // Immediately trigger speak with absolute minimal options
    // Removing the .stop() call entirely as it often aborts the subsequent .speak() call on some Android phones.
    setIsSpeaking(true);
    setIsPaused(false);
    
    ttsService.speak(text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: (e) => {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
      }
    });
  };

  // Auto-speak when a new prediction arrives and confidence is at least 70%
  useEffect(() => {
    if (isRecognizing && predictionData && predictionData.sign && predictionData.confidence >= 70) {
      if (predictionData.sign !== lastSpokenSign) {
        setLastSpokenSign(predictionData.sign);
        handleSpeak(predictionData.sign);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionData, isRecognizing]);
  
  const selectedLanguage = settings.ttsLanguage;

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStartRecognition = () => {
    dispatch(startWsRecognition());
    setIsRecognizing(true);
  };

  const handleStopRecognition = () => {
    dispatch(stopWsRecognition());
    setIsRecognizing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Header title="Translation" showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Detected Sign Card */}
        <BaseCard style={styles.card}>
          <View style={styles.cardHeader}>
            <PaperText style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Detected Sign</PaperText>
            <IconButton 
              icon="content-copy" 
              iconColor={theme.colors.primary} 
              containerColor={theme.colors.surfaceVariant}
              size={20} 
              onPress={() => {}} 
              style={styles.iconButton}
            />
          </View>
          <View style={styles.detectedSignBody}>
            <PaperText style={[styles.detectedText, { color: theme.colors.primary }]}>{detectedSign}</PaperText>
            <PaperText style={styles.emojiText}>👋</PaperText>
          </View>
        </BaseCard>

        {/* Speech Output Card */}
        <BaseCard style={styles.card}>
          <View style={styles.cardHeader}>
            <PaperText style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant }]}>Speech Output</PaperText>
          </View>
          <View style={styles.speechOutputBody}>
            <PaperText style={[styles.speechText, { color: theme.colors.onSurface }]}>{speechOutput}</PaperText>
            {isSpeaking ? (
              <IconButton 
                icon="pause" 
                iconColor={theme.colors.onPrimary}
                containerColor={theme.colors.primary}
                size={24} 
                onPress={handlePause} 
                style={styles.playButton}
              />
            ) : (
              <IconButton 
                icon="play" 
                iconColor={theme.colors.onPrimary}
                containerColor={theme.colors.primary}
                size={24} 
                onPress={handleSpeak} 
                style={styles.playButton}
              />
            )}
          </View>
        </BaseCard>

        {/* Language Selector */}
        <View style={styles.languageContainer}>
          <PaperText style={[styles.cardLabel, { color: theme.colors.onSurfaceVariant, marginBottom: themeConstants.spacing.xs }]}>Language</PaperText>
          <TouchableOpacity style={[styles.languageSelector, { borderColor: theme.colors.surfaceVariant, backgroundColor: theme.colors.surface }]} activeOpacity={0.7}>
            <PaperText style={[styles.languageText, { color: theme.colors.onSurface }]}>{selectedLanguage}</PaperText>
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {isRecognizing ? (
            <PrimaryButton 
              title="Stop Recognition" 
              icon="stop-circle-outline"
              onPress={handleStopRecognition} 
              style={{ backgroundColor: theme.colors.error }}
            />
          ) : (
            <PrimaryButton 
              title="Start Recognition" 
              icon="play-circle-outline"
              onPress={handleStartRecognition} 
            />
          )}

          <PrimaryButton 
            title="Speak" 
            icon="volume-high"
            onPress={handleSpeak} 
          />
          
          <OutlinedButton 
            title="Share" 
            icon="share-variant"
            onPress={() => {}} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: themeConstants.spacing.m,
  },
  card: {
    marginBottom: themeConstants.spacing.l,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.xs,
  },
  cardLabel: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
  },
  iconButton: {
    margin: 0,
    borderRadius: themeConstants.radii.s,
    width: 36,
    height: 36,
  },
  detectedSignBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: themeConstants.spacing.xs,
  },
  detectedText: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: 28,
    letterSpacing: 1,
  },
  emojiText: {
    fontSize: 32,
  },
  speechOutputBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: themeConstants.spacing.xs,
  },
  speechText: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.xl,
  },
  playButton: {
    margin: 0,
  },
  languageContainer: {
    marginBottom: themeConstants.spacing.xl,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: themeConstants.radii.m,
    padding: themeConstants.spacing.m,
  },
  languageText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.m,
  },
  actionButtonsContainer: {
    gap: themeConstants.spacing.m,
  },
});
