// flows/purchase/screens/PaymentTermsScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectionCard from '../../../../components/common/SelectionCard';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const PaymentTermsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { supplier, grandTotal, directTotal } = route.params?.flowData || {};

  const totalAmount = grandTotal || directTotal || 0;
  const [paymentType, setPaymentType] = useState<string | null>(null);

  const handleContinue = () => {
    if (paymentType === 'full') {
      navigateToScreen('FullPayment', { totalAmount , supplier });
    } else if (paymentType === 'credit') {
      navigateToScreen('CreditTerms', { totalAmount, supplier });
    } else if (paymentType === 'partial') {
      navigateToScreen('PartialPayment', { totalAmount, supplier });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supplier</Text>
            <Text style={styles.summaryValue}>{supplier?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValueLarge}>
              PKR {totalAmount.toLocaleString()}
            </Text>
          </View>
          {supplier?.outstanding > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Previous Outstanding</Text>
              <Text style={[styles.summaryValue, styles.outstandingText]}>
                PKR {supplier.outstanding.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Type Selection */}
        <Text style={styles.question}>
          How are you paying {supplier?.name}?
        </Text>

        <SelectionCard
          icon="💰"
          label="Paid in Full"
          description="Already paid the full amount"
          selected={paymentType === 'full'}
          onPress={() => setPaymentType('full')}
        />

        <SelectionCard
          icon="📅"
          label="Credit (Pay Later)"
          description="Will pay after some time"
          selected={paymentType === 'credit'}
          onPress={() => setPaymentType('credit')}
        />

        <SelectionCard
          icon="💵"
          label="Partial Payment"
          description="Paid some, owe the rest"
          selected={paymentType === 'partial'}
          onPress={() => setPaymentType('partial')}
        />

        {/* Supplier Terms Info */}
        {supplier?.creditPeriod && (
          <View style={styles.supplierTermsCard}>
            <Text style={styles.supplierTermsTitle}>
              Supplier's typical terms:
            </Text>
            <Text style={styles.supplierTermsText}>
              {supplier.creditPeriod} days credit period
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!paymentType}
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
  },
  summaryValueLarge: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  outstandingText: {
    color: theme.colors.error,
    fontWeight: '600' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  supplierTermsCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  supplierTermsTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600' as const,
  },
  supplierTermsText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default PaymentTermsScreen;
