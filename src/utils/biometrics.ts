import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { BiometryTypes } from 'react-native-biometrics';

type RNBiometricsCtor = typeof import('react-native-biometrics').default;
type DeviceInfoModule = typeof import('react-native-device-info');

let ReactNativeBiometricsClass: RNBiometricsCtor | null = null;
let DeviceInfoModuleRef: DeviceInfoModule | null = null;

try {
  ReactNativeBiometricsClass = require('react-native-biometrics').default;
} catch (error) {
  console.warn('[Biometrics] react-native-biometrics is not linked yet.', error);
}

try {
  DeviceInfoModuleRef = require('react-native-device-info');
} catch (error) {
  console.warn('[Biometrics] react-native-device-info is not linked yet.', error);
}

const rnBiometrics = ReactNativeBiometricsClass ? new ReactNativeBiometricsClass() : null;

const STORAGE_KEY = 'hisabkaro:biometric_profile';

export interface StoredBiometricProfile {
  userId: string;
  email?: string;
  deviceId: string;
  biometryType?: BiometryTypes | null;
}

export const getStoredBiometricProfile = async (): Promise<StoredBiometricProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredBiometricProfile) : null;
  } catch {
    return null;
  }
};

export const saveBiometricProfile = async (profile: StoredBiometricProfile): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const clearBiometricProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export const getBiometricAvailability = async (): Promise<{
  available: boolean;
  biometryType: BiometryTypes | null;
}> => {
  if (!rnBiometrics) {
    return { available: false, biometryType: null };
  }

  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  } catch {
    return { available: false, biometryType: null };
  }
};

export const biometricKeysExist = async (): Promise<boolean> => {
  if (!rnBiometrics) {
    return false;
  }
  const { keysExist } = await rnBiometrics.biometricKeysExist();
  return keysExist;
};

export const createBiometricKeys = async (): Promise<string> => {
  if (!rnBiometrics) {
    throw new Error('Biometric hardware unavailable on this device.');
  }
  const { publicKey } = await rnBiometrics.createKeys('HisabKaroBiometricKey');
  return publicKey;
};

export const deleteBiometricKeys = async (): Promise<void> => {
  if (!rnBiometrics) {
    return;
  }
  await rnBiometrics.deleteKeys();
};

export const signWithBiometrics = async (payload: string, promptMessage: string): Promise<string> => {
  if (!rnBiometrics) {
    throw new Error('Biometric sensor is not available on this device.');
  }
  const { success, signature } = await rnBiometrics.createSignature({
    promptMessage,
    payload,
  });

  if (!success || !signature) {
    throw new Error('Biometric verification cancelled');
  }

  return signature;
};

export const getDeviceMetadata = async (): Promise<{
  deviceId: string;
  deviceName: string;
  deviceOs: string;
}> => {
  if (!DeviceInfoModuleRef) {
    return {
      deviceId: `fallback-${Platform.OS}-${Date.now()}`,
      deviceName: `${Platform.OS.toUpperCase()} device`,
      deviceOs: `${Platform.OS} ${Platform.Version}`,
    };
  }

  const [deviceId, deviceName, systemName, systemVersion] = await Promise.all([
    DeviceInfoModuleRef.getUniqueId(),
    DeviceInfoModuleRef.getDeviceName(),
    DeviceInfoModuleRef.getSystemName(),
    DeviceInfoModuleRef.getSystemVersion(),
  ]);

  return {
    deviceId,
    deviceName: deviceName ?? `${Platform.OS} device`,
    deviceOs: `${systemName} ${systemVersion}`,
  };
};


