import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../store/hooks';

interface CustomerCardProps {
  name: string;
  location?: string;
  phone?: string;
  outstandingBalance?: number;
  avatarText?: string;
  avatarColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  currency?: string;
  showOutstanding?: boolean;
}

const CustomerCardComponent: React.FC<CustomerCardProps> = ({
  name,
  location,
  phone,
  outstandingBalance = 0,
  avatarText,
  avatarColor,
  onPress,
  style,
  currency = 'Rs.',
  showOutstanding = true,
}) => {
  const theme = useTheme();

  // Generate initials from name
  const initials = avatarText || name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Generate consistent color from name
  const getAvatarColor = () => {
    if (avatarColor) return avatarColor;
    const colors = [
      '#00897B', // Teal
      '#1976D2', // Blue
      '#7B1FA2', // Purple
      '#C2185B', // Pink
      '#F57C00', // Orange
      '#388E3C', // Green
      '#5D4037', // Brown
      '#455A64', // Blue Grey
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const bgColor = getAvatarColor();
  const hasOutstanding = outstandingBalance > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.sm,
          ...theme.shadows.xs,
        },
        avatar: {
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.full,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        avatarText: {
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        content: {
          flex: 1,
        },
        name: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        location: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        rightSection: {
          alignItems: 'flex-end',
        },
        outstandingLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 2,
        },
        outstandingAmount: {
          ...theme.typography.body,
          fontWeight: '600',
          color: hasOutstanding ? theme.colors.error : theme.colors.success,
        },
      }),
    [theme, bgColor, hasOutstanding]
  );

  const formatAmount = (value: number): string => {
    return `${currency} ${Math.abs(value).toLocaleString()}`;
  };

  const content = (
    <>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {(location || phone) && (
          <Text style={styles.location} numberOfLines={1}>
            {location || phone}
          </Text>
        )}
      </View>
      {showOutstanding && (
        <View style={styles.rightSection}>
          <Text style={styles.outstandingLabel}>Outstanding</Text>
          <Text style={styles.outstandingAmount}>
            {formatAmount(outstandingBalance)}
          </Text>
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

export const CustomerCard = memo(CustomerCardComponent);
