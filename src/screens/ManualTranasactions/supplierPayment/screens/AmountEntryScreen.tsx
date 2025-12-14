// flows/supplierPayment/screens/AmountEntryScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountInputField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const AmountEntryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { supplier } = route.params?.flowData || {};
  const [amount, setAmount] = useState(0);

  const remaining = (supplier?.outstanding || 0) - amount;

  const handleContinue = () => {
    navigateToScreen('PaymentMethod', {
      supplier,
      amount,
      remaining,
      paymentType: remaining === 0 ? 'full' : 'partial',
    });
  };

  const quickAmounts = [
    {
      label: `Full ${supplier?.outstanding.toLocaleString()}`,
      value: supplier?.outstanding || 0,
    },
    {
      label: `Half ${Math.floor(
        (supplier?.outstanding || 0) / 2,
      ).toLocaleString()}`,
      value: Math.floor((supplier?.outstanding || 0) / 2),
    },
    ...(supplier?.outstanding >= 100000
      ? [{ label: '100k', value: 100000 }]
      : []),
    ...(supplier?.outstanding >= 50000 ? [{ label: '50k', value: 50000 }] : []),
    ...(supplier?.outstanding >= 25000 ? [{ label: '25k', value: 25000 }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>You owe {supplier?.name}:</Text>
          <Text style={styles.infoAmount}>
            PKR {supplier?.outstanding.toLocaleString()}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>
          How much are you paying to {supplier?.name}?
        </Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: '',
            type: FieldType.AMOUNT,
          }}
          value={amount.toString()}
          onChange={(value: string) => setAmount(Number(value))}
          quickAmounts={quickAmounts}
          onBlur={() => {}}
        />

        {/* Remaining Display */}
        <View style={styles.remainingCard}>
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Paying Now</Text>
            <Text style={styles.remainingValue}>
              PKR {amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Remaining</Text>
            <Text
              style={[
                styles.remainingValue,
                {
                  color:
                    remaining === 0
                      ? '#34C759'
                      : remaining < 0
                      ? '#FF9500'
                      : '#FF3B30',
                },
              ]}
            >
              PKR {remaining.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment Type Badge */}
        <View style={styles.paymentTypeBadge}>
          <Text style={styles.paymentTypeText}>
            {remaining === 0
              ? '✅ Full Payment'
              : remaining > 0
              ? '💵 Partial Payment'
              : '⚠️ Overpayment'}
          </Text>
        </View>

        {/* Warning for overpayment */}
        {amount > supplier?.outstanding * 1.1 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Payment exceeds outstanding. Excess will be advance payment.
            </Text>
          </View>
        )}

        {/* Due Date Info */}
        {remaining > 0 && supplier?.dueDate && (
          <View style={styles.dueDateCard}>
            <Text style={styles.dueDateLabel}>Remaining payment due:</Text>
            <Text style={styles.dueDateValue}>
              {new Date(supplier.dueDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue ✓"
          onPress={handleContinue}
          disabled={amount === 0}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoAmount: {
    ...theme.typography.h2,
    color: theme.colors.error,
    fontWeight: 'bold' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  remainingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  remainingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
  },
  remainingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  remainingValue: {
    ...theme.typography.body,
    fontWeight: '700' as const,
  },
  paymentTypeBadge: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center' as const,
  },
  paymentTypeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  warningCard: {
    backgroundColor: '#FF9500' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF9500',
  },
  dueDateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center' as const,
  },
  dueDateLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dueDateValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default AmountEntryScreen;
