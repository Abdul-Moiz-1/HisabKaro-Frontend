import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { jwtDecode } from 'jwt-decode';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation } from '../../components/common';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../store/hooks';
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

const BiometricVerificationScreen: React.FC<NavigationProps<'BiometricVerification'>> = ({ navigation }) => {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.user);
  const [biometricToggleLoading, setBiometricToggleLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Debug: Log Redux state on mount
  useEffect(() => {
    console.log('=== BiometricVerificationScreen Redux State ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('token exists:', !!token);
    console.log('token type:', typeof token);
    if (token) {
      console.log('token length:', token.length);
    }
  }, []);

  // // Extract userId from JWT token's sub claim
  // const getUserIdFromToken = (): string | null => {
  //   if (!token) return null;
  //   try {
  //     const decoded = jwtDecode<JwtPayload>(token);
  //     return decoded.sub ?? null;
  //   } catch {
  //     return null;
  //   }
    
  // };

  const getUserIdFromToken = (): string | null => {
    if (!token) {
      console.log('❌ No token available in Redux state');
      return null;
    }
    try {
      console.log('Token exists, attempting to decode...');
      console.log('Token (first 50 chars):', token.substring(0, 50));
      const decoded: any = jwtDecode(token);
      console.log('Decoded token:', JSON.stringify(decoded, null, 2));
      console.log('Sub claim:', decoded.sub);
      return decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
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
    // Extract userId from JWT token
    const userId = getUserIdFromToken();
    
    // Debug logging
    console.log('=== Biometric Enable Debug ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('token exists:', !!token);
    console.log('userId from token (sub):', userId);
    console.log('userId type:', typeof userId);
    console.log('userId length:', userId?.length);
    
    // Check if user is authenticated and has a valid token with userId
    if (!isAuthenticated || !token || !userId || userId.trim() === '') {
      console.log('❌ User validation failed - no valid userId in token');
      Toast.show({
        type: 'error',
        text1: 'Sign in required',
        text2: 'Please login with your email and password first',
      });
      return;
    }

    console.log('✅ User validation passed, proceeding with biometric setup');
    setBiometricToggleLoading(true);
    try {
      const availability = await getBiometricAvailability();
      console.log('Biometric availability:', availability);
      
      if (!availability.available) {
        Toast.show({
          type: 'error',
          text1: 'Biometric unavailable',
          text2: 'Your device does not support biometric authentication',
        });
        return;
      }

      const keysExist = await biometricKeysExist();
      console.log('Keys exist:', keysExist);
      
      if (keysExist) {
        await deleteBiometricKeys();
        console.log('Old keys deleted');
      }

      console.log('Generating biometric keys...');
      const generatedPublicKey = await createBiometricKeys();
      console.log('New keys generated, public key length:', generatedPublicKey.length);
      
      const deviceMeta = await getDeviceMetadata();
      console.log('Device metadata:', deviceMeta);

      console.log('Registering device with backend...');
      // Backend extracts userId from JWT token (Authorization header)
      await biometricService.registerDevice({
        deviceId: deviceMeta.deviceId,
        publicKey: generatedPublicKey,
        deviceName: deviceMeta.deviceName,
        deviceOs: deviceMeta.deviceOs,
      });
      console.log('Device registered with backend');

      await saveBiometricProfile({
        userId: userId,
        email: user?.email,
        deviceId: deviceMeta.deviceId,
        biometryType: availability.biometryType,
      });
      console.log('Biometric profile saved locally');

      setBiometricEnabled(true);
      Toast.show({
        type: 'success',
        text1: 'Fingerprint enabled',
        text2: 'You can now sign in with your fingerprint',
      });
    } catch (error) {
      console.error('Biometric setup error:', error);
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

  const disableBiometricLogin = async () => {
    setBiometricToggleLoading(true);
    try {
      const profile = await getStoredBiometricProfile();
      if (profile?.deviceId) {
        await biometricService.removeDevice(profile.deviceId);
      }
      await deleteBiometricKeys();
      await clearBiometricProfile();
      setBiometricEnabled(false);
      Toast.show({
        type: 'success',
        text1: 'Fingerprint disabled',
      });
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Unable to disable',
        text2: apiError.message ?? 'Please try again',
      });
    } finally {
      setBiometricToggleLoading(false);
    }
  };

  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      enableBiometricLogin();
    } else {
      disableBiometricLogin();
    }
  };

  return (
    <Container scrollable>
      <HeaderNavigation title="Biometric Security" onBackPress={() => navigation.goBack()} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fingerprint login</Text>
        <Text style={styles.bodyText}>
          Keep this toggle on to unlock the app with your fingerprint instead of typing your password every time.
        </Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{biometricEnabled ? 'Enabled' : 'Disabled'}</Text>
          {biometricToggleLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              thumbColor={biometricEnabled ? theme.colors.primary : theme.colors.surface}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            />
          )}
        </View>
        <View style={styles.noteCard}>
          <Text style={styles.note}>
            Make sure your device fingerprint is set up in system settings. We never store your fingerprint—we only keep a secure key on this device.
          </Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  toggleLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  noteCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default BiometricVerificationScreen;


