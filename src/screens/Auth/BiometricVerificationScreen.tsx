import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
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
  const { user } = useAppSelector((state) => state.user);
  console.log('user', user);
  const [biometricToggleLoading, setBiometricToggleLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const syncProfile = async () => {
      const storedProfile = await getStoredBiometricProfile();
      if (storedProfile?.userId === user?.id) {
        setBiometricEnabled(true);
      } else {
        setBiometricEnabled(false);
      }
    };

    syncProfile();
  }, [user?.id]);

  const enableBiometricLogin = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'info',
        text1: 'Sign in required',
        text2: 'Login before enabling biometrics',
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
        userId: user.id,
        email: user.email,
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


