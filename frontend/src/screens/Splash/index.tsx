import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { hydrateAuth } from '../../store/slices/authSlice';
import { SectionTitle, LoadingIndicator } from '../../components';

export const SplashScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { isHydrating, isAuthenticated, hasSeenOnboarding } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrating) {
      let nextRoute = 'Drawer';
      if (!hasSeenOnboarding || !isAuthenticated) {
        nextRoute = 'Auth';
      }
      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: nextRoute }],
        })
      );
    }
  }, [isHydrating, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionTitle title="Ishara" style={{ color: theme.colors.primary, fontSize: 32 }} />
      <LoadingIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
