import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface ScheduledPayment {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dueDate: string;
  color: string;
  icon: string;
}

const scheduledPayments: ScheduledPayment[] = [
  {
    id: '1',
    title: 'Home service fee',
    subtitle: 'Due daily in 4 days',
    amount: -35,
    dueDate: '3 June',
    color: '#FF6B35',
    icon: '🏠',
  },
  {
    id: '2',
    title: 'Car Insurance',
    subtitle: 'Due daily in 15 days',
    amount: -65,
    dueDate: '14 June',
    color: theme.colors.success,
    icon: '🚗',
  },
  {
    id: '3',
    title: 'Internet',
    subtitle: 'Overdue',
    amount: -35,
    dueDate: '25 May',
    color: theme.colors.secondary,
    icon: '📶',
  },
];

interface ScheduledPaymentsProps {
  onSeeAll?: () => void;
}

export const ScheduledPayments: React.FC<ScheduledPaymentsProps> = ({ onSeeAll }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled payments</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paymentsList}>
        {scheduledPayments.map((payment) => (
          <TouchableOpacity key={payment.id} style={styles.paymentItem}>
            <View style={[styles.paymentIcon, { backgroundColor: payment.color }]}>
              <Text style={styles.iconText}>{payment.icon}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>{payment.title}</Text>
              <Text style={styles.paymentSubtitle}>{payment.subtitle}</Text>
            </View>
            <View style={styles.paymentRight}>
              <Text style={styles.paymentAmount}>${Math.abs(payment.amount)}</Text>
              <Text style={styles.paymentDate}>{payment.dueDate}</Text>
            </View>
            <TouchableOpacity style={styles.chevron}>
              <Text style={styles.chevronText}>›</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  seeAll: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  paymentsList: {
    gap: theme.spacing.sm,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 18,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  paymentSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.sm,
  },
  paymentAmount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  paymentDate: {
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
