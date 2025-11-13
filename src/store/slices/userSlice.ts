import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
    },
  },
});

export const { setUser, updateProfile, setToken, setLoading, logout, clearUser } = userSlice.actions;
export default userSlice.reducer;

