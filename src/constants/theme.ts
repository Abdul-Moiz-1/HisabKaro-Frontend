import { ThemeMode } from '../store/slices/themeSlice';

// Shared theme properties that don't change with mode
const sharedTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 36,
      fontFamily: 'System',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
      fontFamily: 'System',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      fontFamily: 'System',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
      fontFamily: 'System',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
      fontFamily: 'System',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'System',
    },
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const;

// Dark theme colors
const darkColors = {
  primary: '#B4F077',
  secondary: '#5856D6',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',

  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#2A2A2A',

  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    disabled: '#888888',
    inverse: '#1A1A1A',
  },

  border: '#444444',
  divider: '#333333',

  gradient: {
    start: '#FF6B35',
    end: '#4A148C',
  },

  social: {
    facebook: '#1877F2',
    google: '#FFFFFF',
    linkedin: '#0077B5',
  },

  palette: {
    main: '#B4F077',
    widget: '#262626',
    backgroundDark: '#141414',
    grey: '#ACACAC',
    whiteBackground: '#F8F8F8',
    white: '#F1F1F1',

    red: '#E73D1C',
    green: '#0BA800',
    orange: '#F06322',
    brightOrange: '#F45911',
    blue: '#458DF2',
    purple: '#8620ED',

    turquoise: '#0FAAC8',
    royalBlue: '#2C4DC3',
    scarlet: '#EF310C',
  },
};

// Light theme colors
const lightColors = {
  primary: '#7CB342',
  secondary: '#5856D6',
  success: '#2E7D32',
  error: '#C62828',
  warning: '#F57C00',

  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',

  text: {
    primary: '#000000', // Pure black for light theme
    secondary: '#333333', // Dark gray for better contrast
    disabled: '#999999',
    inverse: '#FFFFFF',
  },

  border: '#E0E0E0',
  divider: '#E0E0E0',

  gradient: {
    start: '#FF6B35',
    end: '#4A148C',
  },

  social: {
    facebook: '#1877F2',
    google: '#4285F4',
    linkedin: '#0077B5',
  },

  palette: {
    main: '#7CB342',
    widget: '#F9F9F9',
    backgroundDark: '#F5F5F5',
    grey: '#757575',
    whiteBackground: '#FFFFFF',
    white: '#FFFFFF',

    red: '#E73D1C',
    green: '#0BA800',
    orange: '#F06322',
    brightOrange: '#F45911',
    blue: '#458DF2',
    purple: '#8620ED',

    turquoise: '#0FAAC8',
    royalBlue: '#2C4DC3',
    scarlet: '#EF310C',
  },
};

// Theme shadows (adjusted for both modes)
const getShadows = (mode: ThemeMode) => ({
  sm: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: mode === 'dark' ? 0.1 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: mode === 'dark' ? 0.15 : 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: mode === 'dark' ? 0.2 : 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});

// Create theme based on mode
export const createTheme = (mode: ThemeMode = 'dark') => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  ...sharedTheme,
  shadows: getShadows(mode),
});

// Default theme (dark mode for backward compatibility)
export const theme = createTheme('dark');

export type Theme = ReturnType<typeof createTheme>;
