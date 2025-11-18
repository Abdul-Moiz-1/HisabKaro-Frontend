import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { useMemo } from 'react';
import type { RootState, AppDispatch } from './index';
import { createTheme } from '../constants/theme';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook to get theme based on current mode
export const useTheme = () => {
  const themeMode = useAppSelector((state) => state.theme.mode);
  
  return useMemo(() => createTheme(themeMode), [themeMode]);
};

