import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconProps, ArrowUp, ArrowDown, Lightning, Package } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

type ActivityType = 'income' | 'expense' | 'transfer' | 'restock' | 'custom';

interface ActivityItemProps {
  title: string;
  subtitle: string;
  amount: number;
  type: ActivityType;
  icon?: React.ReactElement<IconProps>;
  onPress?: () => void;
  style?: ViewStyle;
  currency?: string;
}

const ActivityItemComponent: React.FC<ActivityItemProps> = ({
  title,
  subtitle,
  amount,
  type,
  icon,
  onPress,
  style,
  currency = 'PKR',
}) => {
  const theme = useTheme();

  const getTypeConfig = () => {
    switch (type) {
      case 'income':
        return {
          bgColor: theme.colors.statusBackground?.success || '#E8F5E9',
          iconColor: theme.colors.palette?.income || theme.colors.success,
          amountColor: theme.colors.palette?.income || theme.colors.success,
          prefix: '+ ',
          defaultIcon: <ArrowUp weight="bold" />,
        };
      case 'expense':
        return {
          bgColor: theme.colors.statusBackground?.error || '#FFEBEE',
          iconColor: theme.colors.palette?.expense || theme.colors.error,
          amountColor: theme.colors.palette?.expense || theme.colors.error,
          prefix: '- ',
          defaultIcon: <Lightning weight="bold" />,
        };
      case 'transfer':
        return {
          bgColor: theme.colors.statusBackground?.info || '#E1F5FE',
          iconColor: theme.colors.palette?.transfer || theme.colors.info,
          amountColor: theme.colors.text.primary,
          prefix: '',
          defaultIcon: <ArrowUp weight="bold" />,
        };
      case 'restock':
        return {
          bgColor: theme.colors.statusBackground?.info || '#E1F5FE',
          iconColor: theme.colors.palette?.blue || theme.colors.info,
          amountColor: theme.colors.text.primary,
          prefix: '',
          defaultIcon: <Package weight="bold" />,
        };
      default:
        return {
          bgColor: theme.colors.surface,
          iconColor: theme.colors.text.secondary,
          amountColor: theme.colors.text.primary,
          prefix: '',
          defaultIcon: <ArrowUp weight="bold" />,
        };
    }
  };

  const config = getTypeConfig();

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
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: theme.borderRadius.md,
          backgroundColor: config.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        content: {
          flex: 1,
        },
        title: {
          ...theme.typography.body,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        subtitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        amountContainer: {
          alignItems: 'flex-end',
        },
        amount: {
          ...theme.typography.body,
          fontWeight: '600',
          color: config.amountColor,
        },
      }),
    [theme, config]
  );

  const formatAmount = (value: number): string => {
    const formatted = Math.abs(value).toLocaleString();
    return `${config.prefix}${currency} ${formatted}`;
  };

  const renderIcon = () => {
    const iconElement = icon || config.defaultIcon;
    return React.cloneElement(iconElement, {
      size: 22,
      color: config.iconColor,
    });
  };

  const content = (
    <>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatAmount(amount)}</Text>
      </View>
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

export const ActivityItem = memo(ActivityItemComponent);
