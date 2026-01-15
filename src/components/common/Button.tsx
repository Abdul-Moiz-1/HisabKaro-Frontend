import React, { memo, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { IconProps } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactElement<IconProps>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}) => {
  const theme = useTheme();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          borderRadius: theme.borderRadius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          width: fullWidth ? '100%' : undefined,
        },
        button_primary: {
          backgroundColor: theme.colors.primary,
        },
        button_secondary: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        button_outline: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        },
        button_ghost: {
          backgroundColor: 'transparent',
        },
        button_small: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          minHeight: 36,
          gap: theme.spacing.xs,
        },
        button_medium: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 48,
          gap: theme.spacing.sm,
        },
        button_large: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          minHeight: 56,
          gap: theme.spacing.sm,
        },
        buttonDisabled: {
          opacity: 0.5,
        },
        text: {
          fontWeight: '600',
        },
        text_primary: {
          color: theme.colors.text.inverse,
          ...theme.typography.button,
        },
        text_secondary: {
          color: theme.colors.text.primary,
          ...theme.typography.button,
        },
        text_outline: {
          color: theme.colors.primary,
          ...theme.typography.button,
        },
        text_ghost: {
          color: theme.colors.primary,
          ...theme.typography.button,
        },
        text_small: {
          fontSize: 14,
        },
        text_medium: {
          fontSize: 16,
        },
        text_large: {
          fontSize: 18,
        },
        iconContainer: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, fullWidth]
  );

  const buttonStyles = [
    dynamicStyles.button,
    dynamicStyles[`button_${variant}`],
    dynamicStyles[`button_${size}`],
    disabled && dynamicStyles.buttonDisabled,
    style,
  ];

  const textStyles = [
    dynamicStyles.text,
    dynamicStyles[`text_${variant}`],
    dynamicStyles[`text_${size}`],
    textStyle,
  ];

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.text.inverse;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    return React.cloneElement(icon, {
      size: getIconSize(),
      color: getIconColor(),
    });
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={dynamicStyles.iconContainer}>{renderIcon()}</View>
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={dynamicStyles.iconContainer}>{renderIcon()}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export const Button = memo(ButtonComponent);
