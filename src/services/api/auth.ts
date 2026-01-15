import apiClient, { ApiError } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';

// Types
export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  businessName?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  tokens: TokenResponse;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  businessName?: string;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

// Helper to decode JWT payload
export const decodeJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Helper to extract user from token
export const extractUserFromToken = (token: string): User | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return {
    id: (payload.sub as string) || (payload.user_id as string) || '',
    email:
      (payload.email as string) || (payload.preferred_username as string) || '',
    name:
      (payload.name as string) ||
      `${payload.given_name || ''} ${payload.family_name || ''}`.trim() ||
      (payload.email as string) ||
      '',
    firstName: payload.given_name as string,
    lastName: payload.family_name as string,
    role: payload.role as string,
  };
};

// Token storage helpers
export const tokenStorage = {
  setTokens: async (tokens: TokenResponse): Promise<void> => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token),
      AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token),
    ]);
  },

  getAccessToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  setUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  },

  getUser: async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  clearAll: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
      TOKEN_KEYS.USER_DATA,
    ]);
  },
};

// Mock data for development
const MOCK_USER: User = {
  id: 'mock_user_001',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  businessName: 'Demo Business',
  role: 'admin',
};

const MOCK_TOKENS: TokenResponse = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrX3VzZXJfMDAxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTcwNDExNjgwMCwiZXhwIjoxNzA0MjAzMjAwfQ.mock_signature',
  refresh_token: 'mock_refresh_token_123',
  expires_in: 86400,
  refresh_expires_in: 604800,
  token_type: 'Bearer',
};

// API Service
export const authApi = {
  // Login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // Mock login for development
    if (
      payload.username.toLowerCase() === 'test@example.com' &&
      payload.password === '12345678'
    ) {
      await tokenStorage.setTokens(MOCK_TOKENS);
      await tokenStorage.setUser(MOCK_USER);
      return { tokens: MOCK_TOKENS, user: MOCK_USER };
    }

    // Real API call
    const response = await apiClient.post<{ data: TokenResponse }>(
      '/auth/login',
      payload,
    );
    const tokens = response.data;

    await tokenStorage.setTokens(tokens);

    const user = extractUserFromToken(tokens.access_token) || {
      id: `user_${Date.now()}`,
      email: payload.username,
      name: payload.username,
    };

    await tokenStorage.setUser(user);

    return { tokens, user };
  },

  // Signup
  signup: async (payload: SignupPayload): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/signup', payload);
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Silently fail - we'll clear tokens anyway
      console.warn('Logout API call failed:', error);
    } finally {
      await tokenStorage.clearAll();
    }
  },

  // Refresh token
  refreshToken: async (): Promise<TokenResponse> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    await tokenStorage.setTokens(response);
    return response;
  },

  // Forgot password
  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      payload,
    );
  },

  // Verify OTP
  verifyOtp: async (
    payload: VerifyOtpPayload,
  ): Promise<{ valid: boolean; message: string }> => {
    return apiClient.post<{ valid: boolean; message: string }>(
      '/auth/verify-otp',
      payload,
    );
  },

  // Reset password
  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/reset-password', payload);
  },

  // Change password (when logged in)
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      '/auth/change-password',
      payload,
    );
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  // Update profile
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    return apiClient.patch<User>('/auth/me', payload);
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await tokenStorage.getAccessToken();
    return !!token;
  },

  // Get stored user
  getStoredUser: async (): Promise<User | null> => {
    return tokenStorage.getUser();
  },
};

export type { ApiError as AuthApiError };
export default authApi;
