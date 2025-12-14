import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

/**
 * Helper function to create memoized styles with theme
 * Usage: const styles = useMemo(() => createThemedStyles(theme, (theme) => StyleSheet.create({...})), [theme]);
 */
export const createThemedStyles = <T extends Record<string, any>>(
  theme: Theme,
  styleCreator: (theme: Theme) => T
): T => {
  return styleCreator(theme);
};

