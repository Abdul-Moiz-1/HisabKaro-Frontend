// flows/purchase/screens/DirectTotalScreen.tsx
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

const DirectTotalScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { supplier } = route.params?.flowData || {};
  const [totalAmount, setTotalAmount] = useState(0);

  const handleContinue = () => {
    navigateToScreen('PaymentTerms', {
      directTotal: totalAmount,
      skipBill: true,
    });
  };

  const quickAmounts = [
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '25,000', value: 25000 },
    { label: '50,000', value: 50000 },
    { label: '100,000', value: 100000 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Supplier Info */}
        {supplier && (
          <View style={styles.supplierCard}>
            <Text style={styles.supplierLabel}>Buying from:</Text>
            <Text style={styles.supplierName}>{supplier.name}</Text>
          </View>
        )}

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Enter the total bill amount directly. This is useful when you don't
            want to add individual products.
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>What's the total bill amount?</Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'totalAmount',
            name: 'totalAmount',
            label: '',
            type: FieldType.AMOUNT,
          }}
          value={totalAmount.toString()}
          onChange={(value: string) => setTotalAmount(Number(value))}
          quickAmounts={quickAmounts}
          onBlur={() => {}}
        />

        {/* Summary Card */}
        {totalAmount > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Purchase Amount</Text>
              <Text style={styles.summaryValue}>
                PKR {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={totalAmount === 0}
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
  supplierCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  supplierLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  supplierName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default DirectTotalScreen;
