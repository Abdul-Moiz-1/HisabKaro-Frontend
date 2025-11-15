import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../../store/hooks';

export const ThemeStatusBar: React.FC = () => {
  const theme = useTheme();
  
  return (
    <StatusBar
      barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
    />
  );
};

