import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { connectWebSocket } from '../../store/middleware/websocketMiddleware';
import { GloveStatusCard } from '../../components/Cards/GloveStatusCard';
import { LiveSensorCard } from '../../components/Cards/LiveSensorCard';
import { OrientationCard } from '../../components/Cards/OrientationCard';
import { PrimaryButton } from '../../components/Buttons/PrimaryButton';
import { themeConstants } from '../../theme/themeConstants';

type HomeScreenProps = MainTabScreenProps<'HomeTab'>;

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>(); // use any for now or specify root stack navigation

  const dispatch = useDispatch();
  const { flexSensors, orientation } = useSelector((state: RootState) => state.sensor);

  React.useEffect(() => {
    dispatch(connectWebSocket());
  }, [dispatch]);

  // Format real sensor data for UI
  const sensorData = [
    { label: 'Flex 1', value: flexSensors[0], progress: flexSensors[0] / 100 },
    { label: 'Flex 2', value: flexSensors[1], progress: flexSensors[1] / 100 },
    { label: 'Flex 3', value: flexSensors[2], progress: flexSensors[2] / 100 },
    { label: 'Flex 4', value: flexSensors[3], progress: flexSensors[3] / 100 },
    { label: 'Flex 5', value: flexSensors[4], progress: flexSensors[4] / 100 },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Custom Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => {/* Open Drawer or Menu */}}>
            <Icon name="menu" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Ishara</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign Language Translator
            </Text>
          </View>
          <TouchableOpacity>
            <View>
              <Icon name="bell-outline" size={28} color={theme.colors.primary} />
              <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error, borderColor: theme.colors.background }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.cardsContainer}>
          <GloveStatusCard />
          <LiveSensorCard sensors={sensorData} />
          <OrientationCard 
            pitch={orientation?.pitch || 0} 
            roll={orientation?.roll || 0} 
            yaw={orientation?.yaw || 0} 
          />
          
          <PrimaryButton 
            title="Start Recognition" 
            icon="waveform" 
            onPress={() => navigation.navigate('Recognizing')}
            style={styles.recognitionButton}
          />
          <Text style={[styles.buttonSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tap to start recognizing signs
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: themeConstants.spacing.xxl,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeConstants.spacing.l,
    paddingVertical: themeConstants.spacing.m,
    paddingTop: themeConstants.spacing.xl, // added to move header down
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: themeConstants.typography.fontFamily.bold,
    fontSize: themeConstants.typography.size.xxl, // increased size
  },
  headerSubtitle: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  cardsContainer: {
    paddingHorizontal: themeConstants.spacing.l,
    gap: themeConstants.spacing.l,
    marginTop: themeConstants.spacing.m,
  },
  recognitionButton: {
    marginTop: themeConstants.spacing.s,
    paddingVertical: themeConstants.spacing.s, // make it a bit taller
    borderRadius: 30, // more rounded as per design
    elevation: 4, // add shadow
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonSubtitle: {
    textAlign: 'center',
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.xs,
    marginTop: -8, // pull up closer to the button
  },
});
