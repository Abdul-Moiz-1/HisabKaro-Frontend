export const theme = {
  colors: {
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
  },
  
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
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;


