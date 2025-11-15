import httpClient from './httpClient';

export interface GenerateChallengePayload {
  userId: string;
}

export interface RegisterDevicePayload {
  deviceId: string;
  publicKey: string;
  deviceName?: string;
  deviceOs?: string;
}

export interface AuthenticatePayload {
  userId: string;
  deviceId: string;
  challenge: string;
  signature: string;
}

export interface BiometricDevice {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceOs?: string;
  createdAt?: string;
}

export interface BiometricResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}

export interface BiometricAuthPayload {
  success?: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
}

const unwrap = <T>(response: { data: T }) => response.data;

export const biometricService = {
  generateChallenge: async (payload: GenerateChallengePayload): Promise<BiometricResponse<{ challenge: string; expiresIn?: number }>> => {
    const response = await httpClient.post<BiometricResponse<{ challenge: string; expiresIn?: number }>>('/biometric/challenge', payload);
    return unwrap(response);
  },
  registerDevice: async (payload: RegisterDevicePayload): Promise<BiometricResponse> => {
    const response = await httpClient.post<BiometricResponse>('/biometric/register', payload);
    return unwrap(response);
  },
  authenticate: async (payload: AuthenticatePayload): Promise<BiometricResponse<BiometricAuthPayload>> => {
    const response = await httpClient.post<BiometricResponse<BiometricAuthPayload>>(
      '/biometric/authenticate',
      payload
    );
    return unwrap(response);
  },
  getDevices: async (): Promise<BiometricResponse<BiometricDevice[]>> => {
    const response = await httpClient.get<BiometricResponse<BiometricDevice[]>>('/biometric/devices');
    return unwrap(response);
  },
  removeDevice: async (deviceId: string): Promise<BiometricResponse> => {
    const response = await httpClient.delete<BiometricResponse>(`/biometric/devices/${deviceId}`);
    return unwrap(response);
  },
};


