// theme/hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
// import { Theme } from '../theme/types';
import { useTheme } from '../store/hooks';
import { Theme } from '../constants/theme';

/**
 * Custom hook for creating themed styles
 * @param stylesFn - Function that receives theme and returns styles
 * @returns Memoized styles based on current theme
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T,
) => {
  const theme = useTheme();

  return useMemo(() => StyleSheet.create(stylesFn(theme)), [theme]);
};
