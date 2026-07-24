import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import { HomeScreen } from '../screens/Home';
import { HistoryScreen } from '../screens/History';
import { LearnScreen } from '../screens/Learn';
import { ProfileScreen } from '../screens/Profile';

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
            case 'HistoryTab':
              iconName = 'history';
              break;
            case 'LearnTab':
              iconName = 'book-open-page-variant';
              break;
            case 'ProfileTab':
              iconName = 'account';
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
        name="HistoryTab" 
        component={HistoryScreen} 
        options={{ tabBarLabel: 'History' }} 
      />
      <Tab.Screen 
        name="LearnTab" 
        component={LearnScreen} 
        options={{ tabBarLabel: 'Learn' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};
