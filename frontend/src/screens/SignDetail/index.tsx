import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../../navigation/types';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DUMMY_SIGNS } from '../../data/learnData';
import { PrimaryButton } from '../../components/Buttons/PrimaryButton';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export const SignDetailScreen = ({ route, navigation }: RootStackScreenProps<'SignDetail'>) => {
  const theme = useTheme();
  const { signId } = route.params;

  const sign = DUMMY_SIGNS.find(s => s.id === signId);

  if (!sign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Sign not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="arrow-left" size={28} color={theme.colors.onBackground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Sign Detail</Text>
        <Pressable style={styles.headerButton}>
          <Icon name="heart-outline" size={28} color={theme.colors.onBackground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sign Display Area */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.imageContainer}
        >
          {/* Simulated 3D image space, with a circle background */}
          <View style={[styles.circleBackground, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon name="hand-back-right" size={120} color={theme.colors.primary} />
          </View>
        </Animated.View>

        {/* Sign Name */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.titleContainer}>
          <Text style={[styles.signTitle, { color: theme.colors.primary }]}>{sign.name}</Text>
          <Text style={styles.emojiIcon}>👋</Text>
        </Animated.View>

        {/* Meaning Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>Meaning</Text>
          <Text style={[styles.sectionText, { color: theme.colors.onBackground }]}>
            {sign.meaning}
          </Text>
        </Animated.View>

        {/* Usage Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>Usage</Text>
          <Text style={[styles.sectionText, { color: theme.colors.onBackground }]}>
            {sign.usage}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Practice Button */}
      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.footer}>
        <PrimaryButton
          title="Practice Now"
          onPress={() => {
            // Dummy action
            console.log('Practice pressed for', sign.name);
          }}
          icon={<Icon name="video-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  circleBackground: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow for depth
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  signTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
  },
  emojiIcon: {
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
