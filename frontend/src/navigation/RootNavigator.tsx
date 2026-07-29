import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Fullscreen Screens
import { SplashScreen } from '../screens/Splash';
import { RecognizingScreen } from '../screens/Recognizing';
import { TranslationScreen } from '../screens/Translation';
import { SignDetailScreen } from '../screens/SignDetail';
import { CategoryDetailScreen } from '../screens/CategoryDetail';
import { GloveSettingsScreen } from '../screens/GloveSettings';
import { AboutScreen } from '../screens/About';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {/* Nested Navigators */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      
      {/* Fullscreen screens that hide the bottom tab bar */}
      <Stack.Screen 
        name="Recognizing" 
        component={RecognizingScreen} 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen 
        name="Translation" 
        component={TranslationScreen} 
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="SignDetail" 
        component={SignDetailScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="CategoryDetail" 
        component={CategoryDetailScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="GloveSettings" 
        component={GloveSettingsScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
