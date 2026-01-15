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
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
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
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
      fontFamily: 'System',
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
      fontFamily: 'System',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'System',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      fontFamily: 'System',
    },
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Gradient definitions for the app
  gradients: {
    // Main brand gradient (teal to green)
    primary: {
      colors: ['#00897B', '#00C853', '#1B5E20'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Landing page background gradient
    landing: {
      colors: ['#00897B', '#00A86B', '#008B72'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    // Cash in hand card gradient
    cashCard: {
      colors: ['#00C853', '#00897B'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Bank balance card gradient
    bankCard: {
      colors: ['#E8F5E9', '#C8E6C9'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Success gradient
    success: {
      colors: ['#00C853', '#00E676'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    // Error gradient
    error: {
      colors: ['#FF5252', '#FF1744'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },
} as const;

// Light theme colors (matching mockups)
const lightColors = {
  // Brand colors
  primary: '#00C853',
  primaryDark: '#00897B',
  primaryLight: '#B9F6CA',
  secondary: '#1B5E20',
  accent: '#00E676',
  
  // Status colors
  success: '#00C853',
  error: '#FF5252',
  warning: '#FFA726',
  info: '#29B6F6',

  // Background colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Text colors
  text: {
    primary: '#1A1A2E',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
    link: '#00897B',
  },

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Status backgrounds
  statusBackground: {
    success: '#E8F5E9',
    error: '#FFEBEE',
    warning: '#FFF8E1',
    info: '#E1F5FE',
    pending: '#FFF3E0',
  },

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  
  // Input colors
  input: {
    background: '#F9FAFB',
    border: '#E5E7EB',
    borderFocused: '#00C853',
    placeholder: '#9CA3AF',
  },

  // Social login colors
  social: {
    facebook: '#1877F2',
    google: '#EA4335',
    apple: '#000000',
  },

  // Palette for specific UI elements
  palette: {
    // Green shades
    green50: '#E8F5E9',
    green100: '#C8E6C9',
    green200: '#A5D6A7',
    green300: '#81C784',
    green400: '#66BB6A',
    green500: '#00C853',
    green600: '#00897B',
    green700: '#1B5E20',
    
    // Gray shades
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Accent colors
    red: '#FF5252',
    orange: '#FFA726',
    blue: '#29B6F6',
    purple: '#7C4DFF',
    teal: '#00897B',
    
    // Transaction colors
    income: '#00C853',
    expense: '#FF5252',
    transfer: '#29B6F6',
  },

  // Tab bar
  tabBar: {
    background: '#FFFFFF',
    active: '#00C853',
    inactive: '#9CA3AF',
  },

  // Chip/tag colors
  chip: {
    background: '#E8F5E9',
    text: '#00897B',
    border: '#C8E6C9',
  },
};

// Dark theme colors
const darkColors = {
  // Brand colors
  primary: '#00E676',
  primaryDark: '#00C853',
  primaryLight: '#69F0AE',
  secondary: '#00C853',
  accent: '#B9F6CA',
  
  // Status colors
  success: '#00E676',
  error: '#FF5252',
  warning: '#FFB74D',
  info: '#4FC3F7',

  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#252525',
  cardElevated: '#2D2D2D',

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
    disabled: '#4D4D4D',
    inverse: '#121212',
    link: '#69F0AE',
  },

  // Border colors
  border: '#333333',
  borderLight: '#404040',
  divider: '#333333',

  // Status backgrounds
  statusBackground: {
    success: 'rgba(0, 230, 118, 0.15)',
    error: 'rgba(255, 82, 82, 0.15)',
    warning: 'rgba(255, 183, 77, 0.15)',
    info: 'rgba(79, 195, 247, 0.15)',
    pending: 'rgba(255, 152, 0, 0.15)',
  },

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  
  // Input colors
  input: {
    background: '#252525',
    border: '#333333',
    borderFocused: '#00E676',
    placeholder: '#666666',
  },

  // Social login colors
  social: {
    facebook: '#1877F2',
    google: '#EA4335',
    apple: '#FFFFFF',
  },

  // Palette for specific UI elements
  palette: {
    // Green shades (adjusted for dark mode)
    green50: 'rgba(0, 230, 118, 0.08)',
    green100: 'rgba(0, 230, 118, 0.12)',
    green200: 'rgba(0, 230, 118, 0.16)',
    green300: 'rgba(0, 230, 118, 0.24)',
    green400: '#4CAF50',
    green500: '#00E676',
    green600: '#00C853',
    green700: '#69F0AE',
    
    // Gray shades
    gray50: '#2D2D2D',
    gray100: '#333333',
    gray200: '#404040',
    gray300: '#525252',
    gray400: '#666666',
    gray500: '#808080',
    gray600: '#999999',
    gray700: '#B3B3B3',
    gray800: '#CCCCCC',
    gray900: '#E6E6E6',
    
    // Accent colors
    red: '#FF5252',
    orange: '#FFB74D',
    blue: '#4FC3F7',
    purple: '#B388FF',
    teal: '#4DB6AC',
    
    // Transaction colors
    income: '#00E676',
    expense: '#FF5252',
    transfer: '#4FC3F7',
  },

  // Tab bar
  tabBar: {
    background: '#1E1E1E',
    active: '#00E676',
    inactive: '#666666',
  },

  // Chip/tag colors
  chip: {
    background: 'rgba(0, 230, 118, 0.15)',
    text: '#00E676',
    border: 'rgba(0, 230, 118, 0.3)',
  },
};

// Theme shadows (adjusted for both modes)
const getShadows = (mode: ThemeMode) => ({
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: mode === 'dark' ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: mode === 'dark' ? 0.25 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: mode === 'dark' ? 0.35 : 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: mode === 'dark' ? '#000' : '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: mode === 'dark' ? 0.4 : 0.2,
    shadowRadius: 14,
    elevation: 12,
  },
});

// Create theme based on mode
export const createTheme = (mode: ThemeMode = 'light') => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  ...sharedTheme,
  shadows: getShadows(mode),
});

// Default theme (light mode for the new design)
export const theme = createTheme('light');

export type Theme = ReturnType<typeof createTheme>;
export type ThemeColors = typeof lightColors;
export type ThemeGradients = typeof sharedTheme.gradients;