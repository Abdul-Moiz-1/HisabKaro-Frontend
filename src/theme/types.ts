// theme/types.ts
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;

    background: string;
    surface: string;
    card: string;

    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };

    border: string;
    divider: string;

    gradient: {
      start: string;
      end: string;
    };

    social: {
      facebook: string;
      google: string;
      linkedin: string;
    };

    // Additional semantic colors
    overlay: string;
    ripple: string;
    notification: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
    button: TextStyle;
  };

  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  shadows: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };
}

interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '600';
  lineHeight?: number;
  fontFamily: string;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}
