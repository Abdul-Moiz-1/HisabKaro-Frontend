import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { theme } from '../../constants/theme';
import { Container, Button, Logo, Checkbox, Divider, SocialLoginButton } from '../../components/common';
import { Input } from '../../components/forms';
import { extractUserFromToken, isValidEmail } from '../../utils';
import {
  getBiometricAvailability,
  getStoredBiometricProfile,
  signWithBiometrics,
} from '../../utils/biometrics';
import { useAppDispatch } from '../../store/hooks';
import { setUser, setToken, setLoading, setRefreshToken } from '../../store/slices/userSlice';
import Toast from 'react-native-toast-message';
import { authService, AuthServiceError } from '../../services/authService';
import { biometricService } from '../../services/biometricService';

const LoginScreen: React.FC<NavigationProps<'Login'>> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLocalLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const refreshBiometricAvailability = useCallback(async () => {
    const [profile, availability] = await Promise.all([
      getStoredBiometricProfile(),
      getBiometricAvailability(),
    ]);

    setBiometricAvailable(Boolean(profile) && availability.available);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshBiometricAvailability();
    }, [refreshBiometricAvailability])
  );

  const validateForm = (): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check your email and password',
      });
      return;
    }

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authService.login({
        username: email.trim(),
        password,
      });

      const tokens = response.data;

      dispatch(setToken(tokens.access_token));
      dispatch(setRefreshToken(tokens.refresh_token));

      const parsedUser = extractUserFromToken(tokens.access_token);

      if (parsedUser) {
        dispatch(setUser(parsedUser));
      } else {
        dispatch(
          setUser({
            id: '',
            email,
            name: email,
          })
        );
      }

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });

      navigation.replace(ROUTES.HOME);
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: apiError.message,
      });
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  const handleSocialLogin = (provider: 'facebook' | 'google' | 'linkedin') => {
    Toast.show({
      type: 'info',
      text1: 'Social Login',
      text2: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon`,
    });
  };

  const navigateToSignup = () => {
    navigation.navigate(ROUTES.SIGNUP);
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);

    try {
      const profile = await getStoredBiometricProfile();
      if (!profile) {
        throw new Error('Biometric login is not configured for this device.');
      }

      const challengeResponse = await biometricService.generateChallenge({
        userId: profile.userId,
      });

      const challenge = challengeResponse.data?.challenge;
      if (!challenge) {
        throw new Error('Unable to start biometric authentication.');
      }

      const signature = await signWithBiometrics(challenge, 'Login with fingerprint');

      const authResponse = await biometricService.authenticate({
        userId: profile.userId,
        deviceId: profile.deviceId,
        challenge,
        signature,
      });

      const payload = authResponse.data;

      if (payload?.access_token) {
        dispatch(setToken(payload.access_token));
        dispatch(setRefreshToken(payload.refresh_token ?? null));

        const parsedUser = extractUserFromToken(payload.access_token);    // <-----  kashif se bolo username bhi bhejay token mai
        if (parsedUser) {
          dispatch(setUser(parsedUser));
        } else {
          dispatch(
            setUser({
              id: profile.userId,
              email: profile.email ?? email,
              name: profile.email ?? 'User',
            })
          );
        }

        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: 'Signed in with biometrics',
        });

        navigation.replace(ROUTES.HOME);
      } else if (payload?.success) {
        Toast.show({
          type: 'success',
          text1: 'Fingerprint verified',
          text2: 'Please enter your password to finish login',
        });
      } else {
        throw new Error('Biometric authentication failed. Please try again.');
      }
    } catch (error) {
      const message =
        (error as AuthServiceError)?.message ??
        (error instanceof Error ? error.message : 'Biometric login failed');
      Toast.show({
        type: 'error',
        text1: 'Biometric login',
        text2: message,
      });
      await refreshBiometricAvailability();
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <Container scrollable safeArea style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <Text style={styles.welcomeText}>Welcome back!</Text>

        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoComplete="password"
          />

          <View style={styles.optionsRow}>
            <Checkbox checked={rememberMe} onPress={() => setRememberMe(!rememberMe)} label="Remember Me" />
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign in"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.button}
          />

          {biometricAvailable && (
            <View style={styles.biometricContainer}>
              <Text style={styles.biometricLabel}>or quick sign in</Text>
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.biometricIcon}>🔓</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Divider text="or continue with" />

          <View style={styles.socialContainer}>
            <SocialLoginButton provider="facebook" onPress={() => handleSocialLogin('facebook')} />
            <SocialLoginButton provider="google" onPress={() => handleSocialLogin('google')} />
            <SocialLoginButton provider="linkedin" onPress={() => handleSocialLogin('linkedin')} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>or </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  button: {
    marginBottom: theme.spacing.lg,
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  biometricLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  biometricButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricIcon: {
    fontSize: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  signupLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
