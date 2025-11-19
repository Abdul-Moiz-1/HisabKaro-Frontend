// flows/receipt/screens/AmountEntryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { Theme } from '../../../../constants/theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import ActionButton from '../../../../components/common/ActionButton';
import { AmountInputField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';

const AmountEntryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { customer } = route.params?.flowData || {};
  const [amount, setAmount] = useState<number>(0);

  const remaining = customer?.outstanding - amount || 0;

  const quickAmounts = [
    {
      label: `Full ${customer?.outstanding.toLocaleString()}`,
      value: customer?.outstanding || 0,
    },
    {
      label: `Half ${Math.floor(
        (customer?.outstanding || 0) / 2,
      ).toLocaleString()}`,
      value: Math.floor((customer?.outstanding || 0) / 2),
    },
    ...(customer?.outstanding >= 25000 ? [{ label: '25k', value: 25000 }] : []),
    ...(customer?.outstanding >= 10000 ? [{ label: '10k', value: 10000 }] : []),
  ];

  const handleContinue = () => {
    navigateToScreen('PaymentMethod', { amount, remaining });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{customer?.name} owes you:</Text>
          <Text style={styles.infoAmount}>
            PKR {customer?.outstanding.toLocaleString()}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>How much did {customer?.name} pay?</Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: 'amount',
            type: FieldType.AMOUNT,
            required: true,
          }}
          value={amount.toString()}
          onChange={(value: string) => setAmount(Number(value))}
          onBlur={() => {}}
        />

        {/* Quick Amounts */}
        <View style={styles.quickAmountsContainer}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map(quickAmount => (
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.value)}
              >
                <Text style={styles.quickAmountText}>{quickAmount.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Remaining Display */}
        <View style={styles.remainingCard}>
          <Text style={styles.remainingLabel}>Remaining:</Text>
          <Text
            style={[
              styles.remainingAmount,
              {
                color:
                  remaining === 0
                    ? '#34C759'
                    : remaining < 0
                    ? '#FF9500'
                    : '#007AFF',
              },
            ]}
          >
            PKR {remaining.toLocaleString()}
          </Text>
        </View>

        {/* Warning */}
        {amount > customer?.outstanding * 1.1 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Amount exceeds outstanding. Excess will be advance.
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
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  quickAmountsContainer: {
    marginBottom: theme.spacing.lg,
  },
  quickAmountsLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600' as const,
  },
  quickAmounts: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  quickAmountButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  quickAmountText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  remainingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: theme.spacing.md,
  },
  remainingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  remainingAmount: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
  },
  warningCard: {
    backgroundColor: '#FF9500' + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF9500',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default AmountEntryScreen;
