import React, { useState } from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { authService } from '../../api/services/authService';
import { otpSchema } from '../../utils/validationSchemas';
import { AuthStackScreenProps } from '../../navigation/types';
import { PrimaryButton, CustomInput, SectionTitle, showToast, Header } from '../../components';;

export const OTPVerificationScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'OTPVerification'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'OTPVerification'>['route']>();
  const { email } = route.params;

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await authService.verifyOTP(email, data.otp);
      showToast('success', 'Verified', 'OTP verification successful.');
      navigation.navigate('ResetPassword', { email });
    } catch (error: any) {
      showToast('error', 'Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="" showBack />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <SectionTitle title="Verification Code" style={{ fontSize: 28, color: theme.colors.primary }} />
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter the 4-digit code sent to <Text style={{ color: theme.colors.onSurface, fontFamily: themeConstants.typography.fontFamily.semibold }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="4-Digit OTP"
                value={value}
                onChangeText={onChange}
                error={errors.otp?.message}
                keyboardType="numeric"
                leftIcon="numeric"
              />
            )}
          />
          
          <PrimaryButton 
            title="Verify Code" 
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
