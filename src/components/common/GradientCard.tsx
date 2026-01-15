import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IconProps } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface GradientCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  valuePrefix?: string;
  icon?: React.ReactElement<IconProps>;
  gradientColors?: string[];
  onPress?: () => void;
  style?: ViewStyle;
  badge?: string;
  darkText?: boolean;
}

const GradientCardComponent: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  value,
  valuePrefix = '',
  icon,
  gradientColors,
  onPress,
  style,
  badge,
  darkText = false,
}) => {
  const theme = useTheme();

  const colors = gradientColors || theme.gradients.cashCard.colors;
  const textColor = darkText ? theme.colors.text.primary : '#FFFFFF';
  const subtitleColor = darkText ? theme.colors.text.secondary : 'rgba(255, 255, 255, 0.8)';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: theme.borderRadius.xl,
          overflow: 'hidden',
          ...theme.shadows.md,
        },
        gradient: {
          padding: theme.spacing.lg,
          minHeight: 140,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.md,
        },
        iconContainer: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        badge: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.full,
        },
        badgeText: {
          fontSize: 10,
          fontWeight: '600',
          color: textColor,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        content: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        title: {
          fontSize: 14,
          fontWeight: '500',
          color: subtitleColor,
          marginBottom: theme.spacing.xs,
        },
        valueContainer: {
          flexDirection: 'row',
          alignItems: 'baseline',
        },
        valuePrefix: {
          fontSize: 16,
          fontWeight: '600',
          color: textColor,
          marginRight: 4,
        },
        value: {
          fontSize: 28,
          fontWeight: 'bold',
          color: textColor,
        },
        subtitle: {
          fontSize: 12,
          color: subtitleColor,
          marginTop: theme.spacing.xs,
        },
      }),
    [theme, textColor, subtitleColor]
  );

  const CardContent = (
    <LinearGradient
      colors={[...colors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.header}>
        {icon && (
          <View style={styles.iconContainer}>
            {React.cloneElement(icon, {
              size: 22,
              color: textColor,
            })}
          </View>
        )}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          {valuePrefix && <Text style={styles.valuePrefix}>{valuePrefix}</Text>}
          <Text style={styles.value}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{CardContent}</View>;
};

export const GradientCard = memo(GradientCardComponent);
