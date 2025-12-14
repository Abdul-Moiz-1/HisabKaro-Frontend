// flows/sales/screens/DirectTotalScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { AmountInputField } from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesFlow } from '../context/SalesFlowContext';

const DirectTotalScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { data, setDirectTotal, clearNavigationFlags } = useSalesFlow();

  const customer = data.customer;
  const [totalAmount, setTotalAmount] = useState(0);

  // Navigate when directTotal is set in context
  useEffect(() => {
    if (data.isDirectTotalSet && data.directTotal !== null) {
      clearNavigationFlags();
      // @ts-ignore
      navigation.navigate('CreditTerms');
    }
  }, [data.isDirectTotalSet, data.directTotal, navigation, clearNavigationFlags]);

  const handleContinue = () => {
    setDirectTotal(totalAmount);
  };

  const quickAmounts = [
    { label: '1,000', value: 1000 },
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '25,000', value: 25000 },
    { label: '50,000', value: 50000 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Info */}
        {customer && (
          <View style={styles.customerCard}>
            <Text style={styles.customerLabel}>Selling to:</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
          </View>
        )}

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Enter the total sale amount directly. This is useful when you don't
            want to add individual products.
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>What's the total sale amount?</Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: '',
            required: true,
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
              <Text style={styles.summaryLabel}>Total Sale Amount</Text>
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
  customerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  customerLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  customerName: {
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
