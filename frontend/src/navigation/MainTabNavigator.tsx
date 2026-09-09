import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import { HomeScreen } from '../screens/Home';
import { ListenScreen } from '../screens/Listen';
import { LearnScreen } from '../screens/Learn';
import { HistoryScreen } from '../screens/History';
const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'ListenTab':
              iconName = 'microphone';
              break;
            case 'LearnTab':
              iconName = 'book-open-page-variant';
              break;
            case 'HistoryTab':
              iconName = 'history';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="ListenTab" 
        component={ListenScreen} 
        options={{ tabBarLabel: 'Listen' }} 
      />
      <Tab.Screen 
        name="LearnTab" 
        component={LearnScreen} 
        options={{ tabBarLabel: 'Learn' }} 
      />
      <Tab.Screen 
        name="HistoryTab" 
        component={HistoryScreen} 
        options={{ tabBarLabel: 'History' }} 
      />
    </Tab.Navigator>
  );
};
