import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  ResetPassword: { email: string; token: string };
};

// 2. Main Bottom Tabs Types
export type MainTabParamList = {
  HomeTab: undefined;
  ListenTab: undefined;
  LearnTab: undefined;
  HistoryTab: undefined;
};

// 2.5 Drawer Types
export type DrawerParamList = {
  MainTabs: undefined;
  ProfileTab: undefined;
  GloveSettings: undefined;
};

// 3. Root Stack Types (includes fullscreen screens without bottom tabs)
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Drawer: NavigatorScreenParams<DrawerParamList>;
  
  // Fullscreen Stack Screens (navigated from Home/Learn/Profile)
  Recognizing: undefined;
  EditProfile: undefined;
  Translation: { detectedSign: string } | undefined;
  CategoryDetail: { categoryId: string; categoryName: string };
  SignDetail: { signId: string };
  GloveSettings: undefined;
  Calibration: undefined;
  About: undefined;
};

// Helper Types for Screens to use
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;

// We can also add Drawer helper types if needed
import type { DrawerScreenProps } from '@react-navigation/drawer';
export type DrawerNavScreenProps<T extends keyof DrawerParamList> = DrawerScreenProps<DrawerParamList, T>;

// Global definition so useNavigation has strict typing
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
