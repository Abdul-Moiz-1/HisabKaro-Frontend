import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconProps } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface QuickActionButtonProps {
  title: string;
  subtitle?: string;
  icon: React.ReactElement<IconProps>;
  onPress: () => void;
  iconBackgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const QuickActionButtonComponent: React.FC<QuickActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  iconBackgroundColor,
  iconColor,
  style,
  disabled = false,
}) => {
  const theme = useTheme();

  const bgColor = iconBackgroundColor || theme.colors.palette?.green50 || theme.colors.primaryLight;
  const color = iconColor || theme.colors.primary;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
          ...theme.shadows.sm,
        },
        containerDisabled: {
          opacity: 0.5,
        },
        iconContainer: {
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        title: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
          textAlign: 'center',
        },
        subtitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: 2,
        },
      }),
    [theme, bgColor]
  );

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        {React.cloneElement(icon, {
          size: 24,
          color: color,
        })}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

export const QuickActionButton = memo(QuickActionButtonComponent);
