import React, { useState } from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { AppDispatch, RootState } from '../../store';
import { login, clearAuthError } from '../../store/slices/authSlice';
import { loginSchema } from '../../utils/validationSchemas';
import { AuthStackScreenProps } from '../../navigation/types';
import { PrimaryButton, CustomInput, SectionTitle, showToast } from '../../components';;

export const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Handle Redux error state changes
  React.useEffect(() => {
    if (error) {
      showToast('error', 'Login Failed', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: any) => {
    const resultAction = await dispatch(login(data));
    if (login.fulfilled.match(resultAction)) {
      showToast('success', 'Welcome Back!', 'You have successfully logged in.');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        })
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <SectionTitle title="Welcome Back" style={{ fontSize: 28, color: theme.colors.primary }} />
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Login to continue using Ishara
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="Email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              leftIcon="email-outline"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="Password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry={!showPassword}
              leftIcon="lock-outline"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
          )}
        />
        
        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <PrimaryButton 
          title="Login" 
          onPress={handleSubmit(onSubmit)} 
          loading={loading}
          disabled={loading}
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: theme.colors.primary, fontFamily: themeConstants.typography.fontFamily.semibold }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: themeConstants.spacing.l,
    justifyContent: 'center',
  },
  header: {
    marginBottom: themeConstants.spacing.xxl,
  },
  subtitle: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.m,
  },
  form: {
    marginBottom: themeConstants.spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: themeConstants.spacing.l,
  },
  forgotText: {
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
  button: {
    marginTop: themeConstants.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
