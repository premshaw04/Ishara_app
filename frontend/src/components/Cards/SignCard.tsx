import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Sign } from '../../data/learnData';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface SignCardProps {
  sign: Sign;
  onPress: () => void;
  index: number;
  style?: ViewStyle;
}

export const SignCard: React.FC<SignCardProps> = ({ sign, onPress, index, style }) => {
  const theme = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withSpring(0, { damping: 15 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          }
        ]}
      >
        <View style={styles.leftContent}>
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            {/* If there was an image we'd show it here, else just an icon */}
            <Icon name="hand-back-right" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{sign.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {sign.meaning}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});
