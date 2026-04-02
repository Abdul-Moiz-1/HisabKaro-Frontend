import React, { useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LinearGradient from 'react-native-linear-gradient';
import {
  EnvelopeIcon,
  LockIcon,
  FingerprintIcon,
  SunIcon,
  MoonIcon,
  CaretRightIcon,
  ShieldCheckIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { ROUTES } from '../../constants/routes';
import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { Container, Button, Logo, Checkbox } from '../../components/common';
import { Input } from '../../components/forms';
import { toggleTheme } from '../../store/slices/themeSlice';
import { loginUser, clearError } from '../../store/slices/userSlice';
import { loginSchema } from './schemas/authSchemas';

// Define form values inline to avoid schema type mismatch
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}
import {
  getBiometricAvailability,
  getStoredBiometricProfile,
  signWithBiometrics,
} from '../../utils/biometrics';
import { biometricService } from '../../services/biometricService';
import {
  setUser,
  setToken,
  setRefreshToken,
} from '../../store/slices/userSlice';
import { extractUserFromToken } from '../../utils';

const LoginScreen: React.FC<NavigationProps<'Login'>> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error, loginAttempts } = useAppSelector(
    state => state.user,
  );

  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricLoading, setBiometricLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onChange',
  });

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check biometric availability
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
    }, [refreshBiometricAvailability]),
  );

  // Handle login submission
  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      Keyboard.dismiss();

      try {
        const result = await dispatch(
          loginUser({
            username: data.email.trim().toLowerCase(),
            password: data.password,
          }),
        ).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Welcome back! 👋',
          text2: `Signed in as ${result.user.name || result.user.email}`,
        });

        navigation.replace(ROUTES.HOME);
      } catch (err: any) {
        console.log(err);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: err || 'Please check your credentials and try again.',
        });
      }
    },
    [dispatch, navigation],
  );

  // Auto-login for demo purposes removed to prevent focus interference
  /*
  useEffect(() => {
    const data: LoginFormValues = {
      email: 'kashif2@yopmail.com',
      password: 'admin',
      rememberMe: false,
    };
    onSubmit(data);
  }, []);
  */

  // Handle biometric login
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

      const signature = await signWithBiometrics(
        challenge,
        'Login with fingerprint',
      );

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

        const parsedUser = extractUserFromToken(payload.access_token);

        if (parsedUser && parsedUser.id) {
          dispatch(
            setUser({
              id: parsedUser.id,
              email: parsedUser.email,
              name: parsedUser.name || parsedUser.email || 'User',
            }),
          );
        } else {
          dispatch(
            setUser({
              id: profile.userId,
              email: profile.email ?? '',
              name: profile.email ?? 'User',
            }),
          );
        }

        Toast.show({
          type: 'success',
          text1: 'Welcome back! 🔐',
          text2: 'Signed in with biometrics',
        });

        navigation.replace(ROUTES.HOME);
      } else {
        throw new Error('Biometric authentication failed. Please try again.');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Biometric Login Failed',
        text2: err.message || 'Please try again or use email/password.',
      });
      await refreshBiometricAvailability();
    } finally {
      setBiometricLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate(ROUTES.SIGNUP);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate(ROUTES.FORGOT_PASSWORD);
  };

  return (
    <Container scrollable safeArea style={styles.container}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

        <View style={styles.content}>
          {/* Header with Theme Toggle */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Logo size="large" />
            </View>
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={() => dispatch(toggleTheme())}
              activeOpacity={0.7}
            >
              {theme.mode === 'dark' ? (
                <MoonIcon
                  size={22}
                  color={theme.colors.primary}
                  weight="fill"
                />
              ) : (
                <SunIcon size={22} color={theme.colors.primary} weight="fill" />
              )}
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage your business finances
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  leftIcon={
                    <EnvelopeIcon
                      size={20}
                      color={
                        errors.email
                          ? theme.colors.error
                          : theme.colors.text.secondary
                      }
                      weight="regular"
                    />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoComplete="password"
                  required
                  leftIcon={
                    <LockIcon
                      size={20}
                      color={
                        errors.password
                          ? theme.colors.error
                          : theme.colors.text.secondary
                      }
                      weight="regular"
                    />
                  }
                />
              )}
            />

            {/* Options Row */}
            <View style={styles.optionsRow}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value || false}
                    onPress={() => onChange(!value)}
                    label="Remember me"
                  />
                )}
              />
              <TouchableOpacity onPress={navigateToForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            {/* Rate Limiting Warning */}
            {loginAttempts > 2 && (
              <View style={styles.warningContainer}>
                <ShieldCheckIcon
                  size={16}
                  color={theme.colors.warning}
                  weight="fill"
                />
                <Text style={styles.warningText}>
                  {5 - loginAttempts} attempts remaining before temporary
                  lockout
                </Text>
              </View>
            )}

            {/* Biometric Login */}
            {biometricAvailable && (
              <View style={styles.biometricSection}>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign in with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, '#00A86B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.biometricGradient}
                  >
                    {biometricLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <FingerprintIcon
                          size={24}
                          color="#FFFFFF"
                          weight="regular"
                        />
                        <Text style={styles.biometricText}>
                          Use Fingerprint
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sign Up Section */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={navigateToSignup}
              style={styles.signupLink}
            >
              <Text style={styles.signupLinkText}>Create Account</Text>
              <CaretRightIcon
                size={16}
                color={theme.colors.primary}
                weight="bold"
              />
            </TouchableOpacity>
          </View>

          {/* Demo Mode Hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>
              Demo: test@example.com / 12345678
            </Text>
          </View>
        </View>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoSection: {
      flex: 1,
    },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    welcomeSection: {
      marginBottom: theme.spacing.xl,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    form: {
      width: '100%',
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    forgotPassword: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    loginButton: {
      marginBottom: theme.spacing.md,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.colors.warning}15`,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    warningText: {
      fontSize: 12,
      color: theme.colors.warning,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    biometricSection: {
      marginTop: theme.spacing.md,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginHorizontal: theme.spacing.md,
    },
    biometricButton: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    biometricGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    biometricText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    signupSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 'auto',
      paddingTop: theme.spacing.xl,
    },
    signupText: {
      fontSize: 15,
      color: theme.colors.text.secondary,
    },
    signupLink: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    signupLinkText: {
      fontSize: 15,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    demoHint: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    demoHintText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
      fontStyle: 'italic',
    },
  });

export default LoginScreen;
