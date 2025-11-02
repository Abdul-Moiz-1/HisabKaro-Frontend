import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

type SocialProvider = 'facebook' | 'google' | 'linkedin';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const socialConfig = {
  facebook: {
    backgroundColor: theme.colors.social.facebook,
    icon: 'f',
    iconColor: '#FFFFFF',
  },
  google: {
    backgroundColor: theme.colors.social.google,
    icon: 'G',
    iconColor: '#4285F4',
  },
  linkedin: {
    backgroundColor: theme.colors.social.linkedin,
    icon: 'in',
    iconColor: '#FFFFFF',
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
}) => {
  const config = socialConfig[provider];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: config.backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { color: config.iconColor }]}>{config.icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

