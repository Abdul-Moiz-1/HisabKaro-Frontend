import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils';

export interface ScheduledPayment {
  id: string;
  title: string;
  dueDateText: string;
  amount: number;
  specificDate: string;
  color: string;
  icon: string;
  isOverdue?: boolean;
}

interface ScheduledPaymentCardProps {
  payment: ScheduledPayment;
  onPress?: () => void;
}

export const ScheduledPaymentCard: React.FC<ScheduledPaymentCardProps> = ({
  payment,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: payment.color }]}>
        <Text style={styles.iconText}>{payment.icon}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{payment.title}</Text>
        <Text
          style={[
            styles.dueDate,
            payment.isOverdue && styles.overdueText,
          ]}
        >
          {payment.isOverdue ? 'Overdue' : payment.dueDateText}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>-{formatCurrency(Math.abs(payment.amount))}</Text>
        <Text style={styles.date}>{payment.specificDate}</Text>
      </View>
      <TouchableOpacity style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  details: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  dueDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  overdueText: {
    color: theme.colors.error,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.sm,
  },
  amount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontSize: 18,
  },
});

