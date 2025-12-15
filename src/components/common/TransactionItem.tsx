import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  merchant: string;
  amount: number;
  time: string;
  date?: string;
  icon?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showDate = false,
}) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? theme.colors.success : theme.colors.text.primary;
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{transaction.icon || '💰'}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        {showDate && transaction.date && (
          <Text style={styles.date}>{transaction.date}</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(Math.abs(transaction.amount))}
        </Text>
        <Text style={styles.time}>{transaction.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  category: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  merchant: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

