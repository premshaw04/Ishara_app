import React, { useState } from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { authService } from '../../api/services/authService';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { AuthStackScreenProps } from '../../navigation/types';
import { PrimaryButton, CustomInput, SectionTitle, showToast, Header } from '../../components';;

export const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'ForgotPassword'>['navigation']>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await authService.forgotPassword(data.email);
      showToast('success', 'OTP Sent', 'Please check your email for the verification code.');
      navigation.navigate('OTPVerification', { email: data.email });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
      showToast('error', 'Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="" showBack />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <SectionTitle title="Forgot Password" style={{ fontSize: 28, color: theme.colors.primary }} />
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter your email address to receive a one-time password (OTP) to reset your password.
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
          
          <PrimaryButton 
            title="Send OTP" 
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
