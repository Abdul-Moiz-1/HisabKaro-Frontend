import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  percentageChange: number;
  color: string;
  icon: string;
}

interface ExpenseCategoryItemProps {
  category: ExpenseCategory;
  onPress?: () => void;
}

export const ExpenseCategoryItem: React.FC<ExpenseCategoryItemProps> = ({
  category,
  onPress,
}) => {
  const isPositive = category.percentageChange > 0;
  const changeColor = isPositive ? theme.colors.error : theme.colors.success;
  const changeIcon = isPositive ? '↑' : '↓';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <Text style={styles.iconText}>{category.icon}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.amount}>${category.amount.toFixed(2)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.percentageChange, { color: changeColor }]}>
          {Math.abs(category.percentageChange)}% {changeIcon}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  details: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  amount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  percentageChange: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});

