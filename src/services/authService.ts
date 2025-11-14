import httpClient, { ApiError } from './httpClient';

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetTokenPayload {
  code: string;
}

export interface ResetPasswordPayload {
  code: string;
  newPassword: string;
}

export interface LoginResponse {
  status: number;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    scope: string;
  };
  message?: string;
}

export interface BaseResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}

const unwrap = <T>(response: { data: T }) => response.data;

// Dummy user credentials for offline testing
const DUMMY_USER = {
  email: 'test@example.com',
  password: '12345678',
};

// Helper function to base64 encode (React Native compatible)
const base64Encode = (str: string): string => {
  try {
    // Try using Buffer if available (Node.js/React Native polyfill)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64');
    }
    // Fallback: use btoa if available (browser/React Native polyfill)
    if (typeof btoa !== 'undefined') {
      return btoa(str);
    }
    // Manual base64 encoding as last resort
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    return result;
  } catch {
    // If all else fails, return a simple encoded string
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
  }
};

// Helper function to create a simple JWT-like token
const createMockToken = (payload: Record<string, any>): string => {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const tokenPayload = base64Encode(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const signature = base64Encode('dummy-signature')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${header}.${tokenPayload}.${signature}`;
};

export const authService = {
  signup: async (payload: SignupPayload): Promise<BaseResponse> => {
    const response = await httpClient.post<BaseResponse>('/auth/signup', payload);
    return unwrap(response);
  },
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Check for dummy user credentials
    const email = payload.username.toLowerCase().trim();
    if (email === DUMMY_USER.email && payload.password === DUMMY_USER.password) {
      // Return mock response for dummy user
      const now = Math.floor(Date.now() / 1000);
      const accessToken = createMockToken({
        sub: 'test-user-id',
        email: DUMMY_USER.email,
        name: 'Test User',
        preferred_username: DUMMY_USER.email,
        exp: now + 3600, // Expires in 1 hour
        iat: now,
      });
      const refreshToken = createMockToken({
        sub: 'test-user-id',
        type: 'refresh',
        exp: now + 86400, // Expires in 24 hours
        iat: now,
      });

      return {
        status: 200,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          refresh_expires_in: 86400,
          token_type: 'Bearer',
          scope: 'read write',
        },
        message: 'Login successful',
      };
    }

    // Proceed with normal network call for other users
    const response = await httpClient.post<LoginResponse>('/auth/login', payload);
    return unwrap(response);
  },
  refresh: async (payload: RefreshPayload): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>('/auth/refresh', payload);
    return unwrap(response);
  },
  logout: async (payload: RefreshPayload): Promise<BaseResponse> => {
    const response = await httpClient.post<BaseResponse>('/auth/logout', payload);
    return unwrap(response);
  },
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<BaseResponse> => {
    const response = await httpClient.post<BaseResponse>('/auth/forgot-password', payload);
    return unwrap(response);
  },
  verifyResetToken: async (payload: VerifyResetTokenPayload): Promise<BaseResponse<{ valid: boolean; email?: string }>> => {
    const response = await httpClient.post<BaseResponse<{ valid: boolean; email?: string }>>('/auth/verify-reset-token', payload);
    return unwrap(response);
  },
  resetPassword: async (payload: ResetPasswordPayload): Promise<BaseResponse> => {
    const response = await httpClient.post<BaseResponse>('/auth/reset-password', payload);
    return unwrap(response);
  },
};

export type AuthServiceError = ApiError;


