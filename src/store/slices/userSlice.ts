import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  authApi,
  tokenStorage,
  LoginPayload,
  SignupPayload,
  AuthResponse,
  User as AuthUser,
  UpdateProfilePayload,
} from '../../services/api/auth';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  businessName?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  token: string | null;
  refreshToken: string | null;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  token: null,
  refreshToken: null,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Rate limiting config
const MAX_LOGIN_ATTEMPTS = 5000000000000000000;
const LOCKOUT_DURATION = 60000; // 1 minute

// Async Thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>('user/login', async (payload, { rejectWithValue, getState }) => {
  try {
    // Rate limiting check
    const state = getState() as { user: UserState };
    const { loginAttempts, lastLoginAttempt } = state.user;

    if (loginAttempts >= MAX_LOGIN_ATTEMPTS && lastLoginAttempt) {
      const timeSinceLast = Date.now() - lastLoginAttempt;
      if (timeSinceLast < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil(
          (LOCKOUT_DURATION - timeSinceLast) / 1000,
        );
        return rejectWithValue(
          `Too many attempts. Please try again in ${remainingTime} seconds.`,
        );
      }
    }

    const response = await authApi.login(payload);
    return response;
  } catch (error: any) {
    const message =
      error.message ||
      error.response?.data?.message ||
      'Login failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const signupUser = createAsyncThunk<
  { message: string },
  SignupPayload,
  { rejectValue: string }
>('user/signup', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.signup(payload);
    return response;
  } catch (error: any) {
    const message =
      error.message ||
      error.response?.data?.message ||
      'Signup failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error: any) {
      // Even if logout fails, we clear local state
      console.warn('Logout error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  },
);

export const refreshUserToken = createAsyncThunk<
  { access_token: string; refresh_token: string },
  void,
  { rejectValue: string }
>('user/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const tokens = await authApi.refreshToken();
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Token refresh failed');
  }
});

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const user = await authApi.getProfile();
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch profile');
  }
});

export const updateUserProfile = createAsyncThunk<
  User,
  UpdateProfilePayload,
  { rejectValue: string }
>('user/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const user = await authApi.updateProfile(payload);
    await tokenStorage.setUser(user);
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update profile');
  }
});

export const initializeAuth = createAsyncThunk<
  { user: User | null; isAuthenticated: boolean },
  void,
  { rejectValue: string }
>('user/initializeAuth', async (_, { rejectWithValue }) => {
  try {
    const isAuthenticated = await authApi.isAuthenticated();
    if (isAuthenticated) {
      const user = await authApi.getStoredUser();
      return { user, isAuthenticated: !!user };
    }
    return { user: null, isAuthenticated: false };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to initialize auth');
  }
});

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
    },
    resetLoginAttempts: state => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      });

    // Signup
    builder
      .addCase(signupUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Signup failed';
      });

    // Logout
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.isLoading = false;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logoutUser.rejected, state => {
        // Even on error, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.isLoading = false;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      });

    // Refresh Token
    builder
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(refreshUserToken.rejected, state => {
        // Token refresh failed - log out user
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
      });

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update profile';
      });

    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeAuth.rejected, state => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const {
  setUser,
  updateProfile,
  setToken,
  setRefreshToken,
  setLoading,
  setError,
  clearError,
  logout,
  clearUser,
  resetLoginAttempts,
} = userSlice.actions;

export default userSlice.reducer;
