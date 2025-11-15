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
    const email = payload.username.toLowerCase().trim();
    const response = await httpClient.post<LoginResponse>('/auth/login', payload);
    return unwrap(response);
  },
  refresh: async (payload: RefreshPayload): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>('/auth/refresh', payload);
    return unwrap(response);
  },
logout: async (payload: RefreshPayload): Promise<BaseResponse> => {
  console.log("API CALLED");
  console.log("Refresh token received:", payload.refreshToken);
  
  try {
    const response = await httpClient.post<BaseResponse>(
      "/auth/logout",
      {}, 
      {
        headers: {
          "Authorization": `Bearer ${payload.refreshToken}`,
        },
      }
    );
    
    console.log("API successful");
    console.log("Response:", response.data);
    
    return unwrap(response);
  } catch (error) {
    console.error("API failed");
    console.error("Error:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    throw error; // Re-throw so frontend can handle it
  }
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


