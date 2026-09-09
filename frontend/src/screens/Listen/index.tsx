import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { themeConstants } from '../../theme/themeConstants';
import { MainTabScreenProps } from '../../navigation/types';

export const ListenScreen = ({ navigation }: MainTabScreenProps<'ListenTab'>) => {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Tap the microphone button below and start speaking to see real-time captions here.');
  
  const intentionToListen = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const transcriptBuffer = useRef('');

  // Animation values for microphone waves
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.5);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.3);

  // Sound bars animation - explicitly defining to avoid hook rules violation
  const bar0 = useSharedValue(10);
  const bar1 = useSharedValue(10);
  const bar2 = useSharedValue(10);
  const bar3 = useSharedValue(10);
  const bar4 = useSharedValue(10);
  const bar5 = useSharedValue(10);
  const bar6 = useSharedValue(10);
  const bar7 = useSharedValue(10);
  const bar8 = useSharedValue(10);
  const bar9 = useSharedValue(10);
  const bar10 = useSharedValue(10);
  const bar11 = useSharedValue(10);
  
  const bars = [bar0, bar1, bar2, bar3, bar4, bar5, bar6, bar7, bar8, bar9, bar10, bar11];

  // expo-speech-recognition Hooks
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setTranscript('Listening...');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    if (intentionToListen.current) {
      setTimeout(() => {
        if (intentionToListen.current) {
          startListening();
        }
      }, 500);
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      // Append new finalized results to our buffer if needed, or just use the current logic
      // event.results[0].transcript contains the full current chunk.
      // If we are auto-restarting, the transcript might get overwritten if we just set it directly.
      // Let's just set it for now. In a real app we'd want to append completed segments.
      const newText = event.results[0].transcript;
      setTranscript((prev) => {
        // If it's restarting, we don't want to lose the previous text!
        if (event.isFinal) {
            transcriptBuffer.current = transcriptBuffer.current ? transcriptBuffer.current + ' ' + newText : newText;
            return transcriptBuffer.current;
        }
        return transcriptBuffer.current ? transcriptBuffer.current + ' ' + newText : newText;
      });
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech recognition error:', event.error);
    if (event.error === 'speech-timeout' || event.error === 'no-speech') {
        // Ignore timeout errors during continuous listening, the 'end' event will restart it
        setIsListening(false);
    } else {
        intentionToListen.current = false;
        setIsListening(false);
        setTranscript((prev) => prev + `\n[Error: ${event.error}]`);
    }
  });

  useEffect(() => {
    if (isListening) {
      scale1.value = withRepeat(withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true);
      opacity1.value = withRepeat(withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true);
      scale2.value = withDelay(500, withRepeat(withTiming(1.8, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true));
      opacity2.value = withDelay(500, withRepeat(withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true));

      bars.forEach((bar) => {
        bar.value = withRepeat(
          withSequence(
            withTiming(Math.random() * 30 + 10, { duration: 300 }),
            withTiming(Math.random() * 30 + 10, { duration: 300 })
          ),
          -1,
          true
        );
      });
    } else {
      scale1.value = withTiming(1);
      opacity1.value = withTiming(0);
      scale2.value = withTiming(1);
      opacity2.value = withTiming(0);
      bars.forEach((bar) => { bar.value = withTiming(10); });
    }
  }, [isListening]);

  const animatedCircle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const animatedCircle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const startListening = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setTranscript('Microphone permission denied.');
        return;
      }
      
      if (!intentionToListen.current) {
        setTranscript('Starting...');
        transcriptBuffer.current = '';
      }
      intentionToListen.current = true;
      
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
      });
    } catch (e) {
      console.error(e);
      setTranscript('Failed to start speech recognition.');
    }
  };

  const stopListening = () => {
    try {
      intentionToListen.current = false;
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // SoundBar component to cleanly handle individual hook calls
  const SoundBar = ({ sharedVal }: { sharedVal: any }) => {
    const animatedStyle = useAnimatedStyle(() => ({ height: sharedVal.value }));
    return <Animated.View style={[styles.soundBar, animatedStyle]} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Status Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Listen</Text>
            <MaterialCommunityIcons name="wifi" size={24} color="#34C759" />
          </View>
          
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: isListening ? '#007AFF' : '#34C759' }]} />
            <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
              {isListening ? 'Listening' : 'Ready'}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Listening to your teacher...
          </Text>

          {/* Microphone Visualization */}
          <View style={styles.micContainer}>
            {isListening && (
              <View style={styles.wavesContainer}>
                {bars.slice(0, 6).map((bar, index) => (
                  <SoundBar key={`left-${index}`} sharedVal={bar} />
                ))}
              </View>
            )}

            <View style={styles.micCenter}>
              <Animated.View style={[styles.circle, styles.circle1, animatedCircle1]} />
              <Animated.View style={[styles.circle, styles.circle2, animatedCircle2]} />
              <View style={[styles.micIconContainer, { backgroundColor: '#E3EFFF' }]}>
                <MaterialCommunityIcons name="microphone" size={40} color="#007AFF" />
              </View>
            </View>

            {isListening && (
              <View style={styles.wavesContainer}>
                {bars.slice(6, 12).map((bar, index) => (
                  <SoundBar key={`right-${index}`} sharedVal={bar} />
                ))}
              </View>
            )}
          </View>

          <Text style={[styles.listenStateText, { color: isListening ? '#007AFF' : theme.colors.onSurfaceVariant }]}>
            {isListening ? 'Listening...' : 'Tap to start'}
          </Text>
          <Text style={[styles.listenStateSub, { color: theme.colors.onSurfaceVariant }]}>
            Your teacher's voice is being converted{'\n'}to text in real time
          </Text>
        </View>

        {/* Live Caption Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: themeConstants.spacing.m }]}>
          <View style={styles.captionHeader}>
            <View style={styles.captionHeaderLeft}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#007AFF" />
              <Text style={[styles.captionTitle, { color: theme.colors.onSurface }]}>Live Caption</Text>
            </View>
            <View style={styles.realtimeTag}>
              <View style={styles.dotSmall} />
              <Text style={styles.realtimeText}>Real-time</Text>
            </View>
          </View>

          <View style={[styles.textBox, { backgroundColor: theme.colors.surfaceVariant }]}>
            <ScrollView 
              ref={scrollViewRef}
              style={{ flex: 1 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              <Text style={[styles.transcriptText, { color: theme.colors.onSurface }]}>
                {transcript}
              </Text>
            </ScrollView>
            <MaterialCommunityIcons 
              name="volume-high" 
              size={20} 
              color="#007AFF" 
              style={styles.speakerIcon}
            />
          </View>
        </View>

      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: isListening ? '#007AFF' : theme.colors.primary }]}
          onPress={toggleListening}
        >
          <MaterialCommunityIcons 
            name={isListening ? "stop" : "microphone"} 
            size={24} 
            color="#FFF" 
          />
          <Text style={styles.actionButtonText}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: themeConstants.radii.l,
    padding: themeConstants.spacing.l,
    ...themeConstants.shadows.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.xs,
  },
  title: {
    fontSize: 24,
    fontFamily: themeConstants.typography.fontFamily.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 4,
  },
  statusText: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  subtitle: {
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
  },
  micContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 120,
  },
  wavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  soundBar: {
    width: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    opacity: 0.5,
  },
  micCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  circle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
  },
  circle1: {
    zIndex: 1,
  },
  circle2: {
    zIndex: 2,
  },
  listenStateText: {
    textAlign: 'center',
    fontSize: themeConstants.typography.size.l,
    fontFamily: themeConstants.typography.fontFamily.semibold,
    marginBottom: 8,
  },
  listenStateSub: {
    textAlign: 'center',
    fontSize: themeConstants.typography.size.s,
    fontFamily: themeConstants.typography.fontFamily.regular,
    lineHeight: 20,
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeConstants.spacing.m,
  },
  captionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionTitle: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.semibold,
    marginLeft: 8,
  },
  realtimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  realtimeText: {
    color: '#34C759',
    fontSize: 10,
    fontFamily: themeConstants.typography.fontFamily.medium,
  },
  textBox: {
    padding: themeConstants.spacing.m,
    borderRadius: themeConstants.radii.m,
    height: 200, // Fixed height so the ScrollView can actually scroll!
  },
  transcriptText: {
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.regular,
    lineHeight: 24,
  },
  speakerIcon: {
    position: 'absolute',
    bottom: themeConstants.spacing.m,
    right: themeConstants.spacing.m,
  },
  footer: {
    padding: themeConstants.spacing.m,
    paddingBottom: themeConstants.spacing.l,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: themeConstants.typography.size.m,
    fontFamily: themeConstants.typography.fontFamily.semibold,
    marginLeft: 8,
  },
});
