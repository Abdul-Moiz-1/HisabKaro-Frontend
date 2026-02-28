import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { FingerprintIcon, LockIcon, ShieldCheckIcon } from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { jwtDecode } from 'jwt-decode';
import { NavigationProps } from '../../types';
import { Container, Button } from '../../components/common';
import { useTheme, useAppSelector } from '../../store/hooks';
import { biometricService } from '../../services/biometricService';
import { AuthServiceError } from '../../services/authService';
import {
  biometricKeysExist,
  clearBiometricProfile,
  createBiometricKeys,
  deleteBiometricKeys,
  getBiometricAvailability,
  getDeviceMetadata,
  getStoredBiometricProfile,
  saveBiometricProfile,
} from '../../utils/biometrics';

const BiometricVerificationScreen: React.FC<NavigationProps<'BiometricVerification'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const { user, isAuthenticated, token } = useAppSelector(state => state.user);
  const [biometricToggleLoading, setBiometricToggleLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const ringAnim1 = new Animated.Value(0.6);
  const ringAnim2 = new Animated.Value(0.4);

  useEffect(() => {
    // Pulse animation for fingerprint icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ring animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim1, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim1, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim2, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim2, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getUserIdFromToken = (): string | null => {
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const syncProfile = async () => {
      const userId = getUserIdFromToken();
      const storedProfile = await getStoredBiometricProfile();
      if (storedProfile?.userId && userId && storedProfile.userId === userId) {
        setBiometricEnabled(true);
      } else {
        setBiometricEnabled(false);
      }
    };

    if (token) {
      syncProfile();
    }
  }, [token]);

  const enableBiometricLogin = async () => {
    const userId = getUserIdFromToken();

    if (!isAuthenticated || !token || !userId || userId.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Sign in required',
        text2: 'Please login with your email and password first',
      });
      return;
    }

    setBiometricToggleLoading(true);
    try {
      const availability = await getBiometricAvailability();

      if (!availability.available) {
        Toast.show({
          type: 'error',
          text1: 'Biometric unavailable',
          text2: 'Your device does not support biometric authentication',
        });
        return;
      }

      const keysExist = await biometricKeysExist();
      if (keysExist) {
        await deleteBiometricKeys();
      }

      const generatedPublicKey = await createBiometricKeys();
      const deviceMeta = await getDeviceMetadata();

      await biometricService.registerDevice({
        deviceId: deviceMeta.deviceId,
        publicKey: generatedPublicKey,
        deviceName: deviceMeta.deviceName,
        deviceOs: deviceMeta.deviceOs,
      });

      await saveBiometricProfile({
        userId: userId,
        email: user?.email,
        deviceId: deviceMeta.deviceId,
        biometryType: availability.biometryType,
      });

      setBiometricEnabled(true);
      Toast.show({
        type: 'success',
        text1: 'Fingerprint enabled',
        text2: 'You can now sign in with your fingerprint',
      });
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Biometric setup failed',
        text2: apiError.message ?? 'Unable to enable biometric authentication',
      });
    } finally {
      setBiometricToggleLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        stepIndicator: {
          alignSelf: 'center',
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          marginTop: theme.spacing.xl,
          ...theme.shadows.sm,
        },
        stepText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontWeight: '600',
          letterSpacing: 1,
        },
        content: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
        },
        iconContainer: {
          position: 'relative',
          width: 200,
          height: 200,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
        },
        ringOuter: {
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: theme.colors.palette?.green50 || '#E8F5E9',
        },
        ringInner: {
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: theme.colors.palette?.green100 || '#C8E6C9',
        },
        fingerprintCircle: {
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.md,
        },
        lockBadge: {
          position: 'absolute',
          top: 30,
          right: 30,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.sm,
        },
        title: {
          ...theme.typography.h1,
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        },
        urduSubtitle: {
          ...theme.typography.body,
          color: theme.colors.primary,
          textAlign: 'center',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: theme.spacing.md,
        },
        description: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: theme.spacing.xl,
        },
        securityNote: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          ...theme.shadows.xs,
        },
        securityNoteText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginLeft: theme.spacing.sm,
        },
        bottomContainer: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        },
        enableButton: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.full,
          paddingVertical: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        },
        enableButtonText: {
          ...theme.typography.button,
          color: '#FFFFFF',
          marginLeft: theme.spacing.sm,
        },
        skipButton: {
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
        },
        skipText: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  return (
    <Container safeArea style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>STEP 1 OF 3</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Animated Fingerprint Icon */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[styles.ringOuter, { opacity: ringAnim2 }]}
          />
          <Animated.View
            style={[styles.ringInner, { opacity: ringAnim1 }]}
          />
          <Animated.View
            style={[
              styles.fingerprintCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <FingerprintIcon size={56} color={theme.colors.primary} weight="regular" />
          </Animated.View>
          <View style={styles.lockBadge}>
            <LockIcon size={18} color={theme.colors.primary} weight="fill" />
          </View>
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.urduSubtitle}>APNA ACCOUNT MEHFOOZ KAREIN</Text>
        <Text style={styles.description}>
          Log in quickly and securely with just a tap. Your biometric data is
          encrypted and stored locally on your device.
        </Text>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <ShieldCheckIcon size={18} color={theme.colors.text.secondary} weight="fill" />
          <Text style={styles.securityNoteText}>
            Your data is encrypted and never shared
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={enableBiometricLogin}
          disabled={biometricToggleLoading}
          activeOpacity={0.8}
        >
          {biometricToggleLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FingerprintIcon size={22} color="#FFFFFF" weight="fill" />
              <Text style={styles.enableButtonText}>Enable Fingerprint</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default BiometricVerificationScreen;
