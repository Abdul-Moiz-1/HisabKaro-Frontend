// flows/purchase/screens/PartialPaymentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountInputField,
  DateField,
} from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const PartialPaymentScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { totalAmount, supplier } = route.params?.flowData || {};

  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + (supplier?.creditPeriod || 30) * 24 * 60 * 60 * 1000),
  );

  const remainingAmount = totalAmount - paidAmount;

  const handleContinue = () => {
    navigateToScreen('Confirmation', {
      paidAmount,
      remainingAmount,
      paymentMethod: paymentMethod ?? undefined,
      paymentStatus: 'partial',
      paymentDate: paymentDate.toISOString(),
      dueDate: dueDate.toISOString(),
    });
  };

  const quickAmounts = [
    { label: 'Half', value: Math.floor(totalAmount / 2) },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '100k', value: 100000 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Display */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Bill Amount:</Text>
          <Text style={styles.totalValue}>
            PKR {totalAmount?.toLocaleString()}
          </Text>
        </View>

        {/* Amount Paid Section */}
        <Text style={styles.question}>How much did you pay now?</Text>

        <AmountInputField
          field={{
            id: 'paidAmount',
            name: 'paidAmount',
            label: '',
            type: FieldType.AMOUNT,
          }}
          value={paidAmount.toString()}
          onChange={(value: string) => setPaidAmount(Number(value))}
          quickAmounts={quickAmounts}
          onBlur={() => {}}
        />

        {/* Remaining Display */}
        <View style={styles.remainingCard}>
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Paid Now</Text>
            <Text style={styles.remainingValue}>
              PKR {paidAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Remaining (Credit)</Text>
            <Text style={[styles.remainingValue, styles.remainingValueDanger]}>
              PKR {remainingAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        {paidAmount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How did you pay?</Text>

            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'cash' &&
                    styles.paymentMethodButtonSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'cash' &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  💵 Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'bank' &&
                    styles.paymentMethodButtonSelected,
                ]}
                onPress={() => setPaymentMethod('bank')}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'bank' &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  🏦 Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'card' &&
                    styles.paymentMethodButtonSelected,
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'card' &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  💳 Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Date</Text>
          <View style={styles.quickDueDates}>
            <TouchableOpacity
              style={styles.quickDueDateButton}
              onPress={() => setPaymentDate(new Date())}
            >
              <Text style={styles.quickDueDateText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDueDateButton}
              onPress={() => setPaymentDate(new Date(Date.now() - 24 * 60 * 60 * 1000))}
            >
              <Text style={styles.quickDueDateText}>Yesterday</Text>
            </TouchableOpacity>
          </View>

          <DateField
            field={{
              id: 'paymentDate',
              name: 'paymentDate',
              label: '',
              type: FieldType.DATE,
            }}
            value={paymentDate.toISOString()}
            onChange={(value: string) => setPaymentDate(new Date(value))}
            onBlur={() => {}}
          />
        </View>

        {/* Due Date for Remaining */}
        {remainingAmount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              When will you pay the remaining PKR{' '}
              {remainingAmount.toLocaleString()}?
            </Text>

            <DateField
              field={{
                id: 'dueDate',
                name: 'dueDate',
                label: '',
                type: FieldType.DATE,
              }}
              value={dueDate.toISOString()}
              onChange={(value: string) => setDueDate(new Date(value))}
              onBlur={() => {}}
            />

            <View style={styles.quickDueDates}>
              <TouchableOpacity
                style={styles.quickDueDateButton}
                onPress={() =>
                  setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                }
              >
                <Text style={styles.quickDueDateText}>7 days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickDueDateButton}
                onPress={() =>
                  setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                }
              >
                <Text style={styles.quickDueDateText}>30 days</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Complete Purchase ✓"
          onPress={handleContinue}
          disabled={paidAmount === 0 || !paymentMethod}
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
  totalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  totalLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  totalValue: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
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
    marginBottom: theme.spacing.lg,
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
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  remainingValueDanger: {
    color: theme.colors.error,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  paymentMethods: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  paymentMethodButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  paymentMethodText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  paymentMethodTextSelected: {
    color: theme.colors.primary,
  },
  quickDueDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickDueDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickDueDateText: {
    ...theme.typography.caption,
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

export default PartialPaymentScreen;
