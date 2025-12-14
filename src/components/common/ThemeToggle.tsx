// components/ThemeToggle.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme, useThemedStyles } from '../../theme';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useThemedStyles(Themestyle);
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.icon}>
        <Text style={styles.text}>{isDark ? '🌙' : '☀️'}</Text>
      </View>
      {/* <Text style={[styles.text, { color: theme.colors.text.primary }]}>
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </Text> */}
    </TouchableOpacity>
  );
};

const Themestyle = (theme: Theme) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
