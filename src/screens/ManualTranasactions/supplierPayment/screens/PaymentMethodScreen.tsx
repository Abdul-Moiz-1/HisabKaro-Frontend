// flows/supplierPayment/screens/PaymentMethodScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectionCard from '../../../../components/common/SelectionCard';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const paymentMethods = [
  {
    value: 'cash',
    label: 'Cash',
    icon: '💵',
    description: 'Pay in cash',
    navigateTo: 'Confirmation',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    icon: '🏦',
    description: 'Transfer from your account',
    navigateTo: 'BankSelection',
  },
  {
    value: 'wallet',
    label: 'Mobile Wallet',
    icon: '📱',
    description: 'JazzCash, Easypaisa, etc.',
    navigateTo: 'WalletSelection',
  },
  {
    value: 'cheque',
    label: 'Cheque',
    icon: '📝',
    description: 'Issue a cheque',
    navigateTo: 'ChequeDetails',
  },
  {
    value: 'card',
    label: 'Card/POS',
    icon: '💳',
    description: 'Credit/Debit card payment',
    navigateTo: 'Confirmation',
  },
];

const PaymentMethodScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { supplier, amount, remaining } = route.params?.flowData || {};
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleContinue = () => {
    const method = paymentMethods.find(m => m.value === selectedMethod);
    if (method) {
      navigateToScreen(method.navigateTo, {
        paymentMethod: selectedMethod ?? undefined,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paying to</Text>
            <Text style={styles.summaryValue}>{supplier?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {amount?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>How are you paying?</Text>

        {/* Payment Methods */}
        {paymentMethods.map(method => (
          <SelectionCard
            key={method.value}
            icon={method.icon}
            label={method.label}
            description={method.description}
            selected={selectedMethod === method.value}
            onPress={() => setSelectedMethod(method.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!selectedMethod}
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    textAlign: 'right' as const,
  },
  summaryValueLarge: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default PaymentMethodScreen;
