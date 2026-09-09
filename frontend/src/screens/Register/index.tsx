import React, { useState } from 'react';
import { themeConstants } from '../../theme/themeConstants';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { authService } from '../../api/services/authService';
import { registerSchema } from '../../utils/validationSchemas';
import { AuthStackScreenProps } from '../../navigation/types';
import { PrimaryButton, CustomInput, SectionTitle, showToast, Header, GoogleButton } from '../../components';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { login, googleLogin } from '../../store/slices/authSlice';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export const RegisterScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '76111054859-aicbgdvp8hto30a3rrudb9gud8echcfn.apps.googleusercontent.com',
    androidClientId: '76111054859-aicbgdvp8hto30a3rrudb9gud8echcfn.apps.googleusercontent.com',
    iosClientId: '76111054859-aicbgdvp8hto30a3rrudb9gud8echcfn.apps.googleusercontent.com',
    //   expoClientId: '76111054859-aicbgdvp8hto30a3rrudb9gud8echcfn.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        dispatch(googleLogin(authentication.idToken)).then((resultAction) => {
          if (googleLogin.fulfilled.match(resultAction)) {
            showToast('success', 'Account Created', 'Welcome to Ishara!');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Drawer' as never }],
              })
            );
          }
        });
      }
    }
  }, [response]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await authService.register(data);
      // Simulate auto-login after register
      await dispatch(login({ email: data.email, password: data.password }));
      showToast('success', 'Account Created', 'Welcome to Ishara!');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Drawer' as never }],
        })
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      showToast('error', 'Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <SectionTitle title="Create Account" style={{ fontSize: 28, color: theme.colors.primary }} />
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign up to get started
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                leftIcon="account-outline"
              />
            )}
          />
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

          <PrimaryButton
            title="Register"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleButton
            onPress={() => promptAsync()}
            disabled={!request || loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontFamily: themeConstants.typography.fontFamily.semibold }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: themeConstants.spacing.l,
    flexGrow: 1,
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
  button: {
    marginTop: themeConstants.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: themeConstants.spacing.l,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: themeConstants.spacing.l,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    marginHorizontal: themeConstants.spacing.m,
    color: 'rgba(0,0,0,0.4)',
    fontFamily: themeConstants.typography.fontFamily.medium,
    fontSize: themeConstants.typography.size.s,
  },
});
