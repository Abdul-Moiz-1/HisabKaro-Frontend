// theme/hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme/types';

/**
 * Custom hook for creating themed styles
 * @param stylesFn - Function that receives theme and returns styles
 * @returns Memoized styles based on current theme
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T,
) => {
  const { theme } = useTheme();

  return useMemo(() => StyleSheet.create(stylesFn(theme)), [theme]);
};
