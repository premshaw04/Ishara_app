import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { DrawerParamList } from './types';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Navigators & Screens
import { MainTabNavigator } from './MainTabNavigator';
import { ProfileScreen } from '../screens/Profile';
import { GloveSettingsScreen } from '../screens/GloveSettings';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <ProfileScreen />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 320,
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
      />
    </Drawer.Navigator>
  );
};
