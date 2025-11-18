import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import ReactNativeBiometricsModule from 'react-native-biometrics';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Setup crypto.getRandomValues polyfill for React Native
// This is required by TweetNaCl for random number generation
(function() {
  if (typeof global.crypto !== 'object') {
    (global as any).crypto = {};
  }
  
  if (typeof global.crypto.getRandomValues !== 'function') {
    (global.crypto as any).getRandomValues = function(buffer: Uint8Array) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    };
  }
  
  // Also set up for window if it exists
  if (typeof window !== 'undefined') {
    if (typeof (window as any).crypto !== 'object') {
      (window as any).crypto = {};
    }
    if (typeof (window as any).crypto.getRandomValues !== 'function') {
      (window as any).crypto.getRandomValues = (global.crypto as any).getRandomValues;
    }
  }
})();

type RNBiometricsCtor = typeof import('react-native-biometrics').default;
type DeviceInfoModule = typeof import('react-native-device-info');
type BiometryTypes = typeof ReactNativeBiometricsModule.BiometryTypes[keyof typeof ReactNativeBiometricsModule.BiometryTypes];

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

// Storage key for nacl keys
const NACL_KEYS_STORAGE_KEY = 'hisabkaro:nacl_keys';

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
  try {
    const storedKeys = await AsyncStorage.getItem(NACL_KEYS_STORAGE_KEY);
    return storedKeys !== null;
  } catch {
    return false;
  }
};

export const createBiometricKeys = async (): Promise<string> => {
  if (!rnBiometrics) {
    throw new Error('Biometric hardware unavailable on this device.');
  }

  // Debug: Check if crypto.getRandomValues is available
  console.log('crypto object exists:', typeof global.crypto);
  console.log('crypto.getRandomValues exists:', typeof global.crypto?.getRandomValues);
  
  try {
    // Test the random function
    const testArray = new Uint8Array(8);
    global.crypto.getRandomValues(testArray);
    console.log('Random test successful:', Array.from(testArray).slice(0, 4));
  } catch (error) {
    console.error('Random test failed:', error);
    throw new Error('Random number generation not available');
  }

  // Generate Ed25519 key pair using nacl
  console.log('Attempting to generate NaCl key pair...');
  const keyPair = nacl.sign.keyPair();
  console.log('Key pair generated successfully');
  
  // Store the key pair securely (in production, consider using secure storage)
  const keysData = {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
  
  await AsyncStorage.setItem(NACL_KEYS_STORAGE_KEY, JSON.stringify(keysData));
  
  // Return public key in base64 format
  return keysData.publicKey;
};

export const deleteBiometricKeys = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(NACL_KEYS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to delete biometric keys:', error);
  }
};

export const signWithBiometrics = async (payload: string, promptMessage: string): Promise<string> => {
  if (!rnBiometrics) {
    throw new Error('Biometric sensor is not available on this device.');
  }

  // First, verify biometrics with the user
  const { success } = await rnBiometrics.simplePrompt({
    promptMessage,
  });

  if (!success) {
    throw new Error('Biometric verification cancelled');
  }

  // Retrieve stored keys
  const storedKeysJson = await AsyncStorage.getItem(NACL_KEYS_STORAGE_KEY);
  if (!storedKeysJson) {
    throw new Error('No biometric keys found. Please set up biometric authentication first.');
  }

  const keysData = JSON.parse(storedKeysJson);
  const secretKey = naclUtil.decodeBase64(keysData.secretKey);
  
  // Sign the payload using nacl
  const messageBytes = naclUtil.decodeBase64(payload);
  const signature = nacl.sign.detached(messageBytes, secretKey);
  
  // Return signature in base64 format
  return naclUtil.encodeBase64(signature);
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


