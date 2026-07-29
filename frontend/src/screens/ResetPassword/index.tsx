import React, { useState } from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { authService } from '../../api/services/authService';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import { AuthStackScreenProps } from '../../navigation/types';
import { PrimaryButton, CustomInput, SectionTitle, showToast, Header } from '../../components';;

export const ResetPasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'ResetPassword'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'ResetPassword'>['route']>();
  const { email } = route.params;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await authService.resetPassword(data.password, ''); // Pass empty token for dummy, or retrieve if passed
      showToast('success', 'Success', 'Your password has been successfully reset. Please log in.');
      navigation.navigate('Login');
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="" showBack />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <SectionTitle title="Reset Password" style={{ fontSize: 28, color: theme.colors.primary }} />
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Create a new password for {email}
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="New Password"
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showPassword}
                leftIcon="lock-check-outline"
              />
            )}
          />
          
          <PrimaryButton 
            title="Update Password" 
            onPress={handleSubmit(onSubmit)} 
            loading={loading}
            disabled={loading}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: themeConstants.spacing.l,
    flex: 1,
  },
  header: {
    marginBottom: themeConstants.spacing.xxl,
  },
  subtitle: {
    fontFamily: themeConstants.typography.fontFamily.regular,
    fontSize: themeConstants.typography.size.m,
    lineHeight: 24,
    marginTop: themeConstants.spacing.s,
  },
  form: {
    marginBottom: themeConstants.spacing.xl,
  },
  button: {
    marginTop: themeConstants.spacing.l,
  },
});
