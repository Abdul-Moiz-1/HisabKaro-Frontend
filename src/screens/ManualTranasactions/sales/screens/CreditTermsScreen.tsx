// flows/sales/screens/CreditTermsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import SelectionCard from '../../../../components/common/SelectionCard';
import { DateField, TextAreaField } from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesFlow } from '../context/SalesFlowContext';

const CreditTermsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { data, setPaymentDetails, clearNavigationFlags } = useSalesFlow();

  const customer = data.customer;
  const cartTotal = data.cartTotal;
  const directTotal = data.directTotal;

  const totalAmount = cartTotal || directTotal || 0;

  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | null>(
    null,
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );
  const [notes, setNotes] = useState('');

  // Navigate when payment details are set in context
  useEffect(() => {
    if (data.isReadyForConfirmation && data.paymentType !== null) {
      clearNavigationFlags();
      // @ts-ignore
      navigation.navigate('Confirmation');
    }
  }, [data.isReadyForConfirmation, data.paymentType, navigation, clearNavigationFlags]);

  const handleContinue = () => {
    if (!paymentType) return;
    
    setPaymentDetails({
      paymentType,
      dueDate: paymentType === 'credit' ? dueDate.toISOString() : undefined,
      notes,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{customer?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValueLarge}>
              PKR {totalAmount.toLocaleString()}
            </Text>
          </View>
          {customer?.outstanding > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Previous Outstanding</Text>
              <Text style={[styles.summaryValue, styles.outstandingText]}>
                PKR {customer.outstanding.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Type Selection */}
        <Text style={styles.question}>Payment terms?</Text>

        <SelectionCard
          icon="💵"
          label="Cash Sale"
          description="Customer paid immediately"
          selected={paymentType === 'cash'}
          onPress={() => setPaymentType('cash')}
        />

        <SelectionCard
          icon="📅"
          label="Credit Sale"
          description="Customer will pay later"
          selected={paymentType === 'credit'}
          onPress={() => setPaymentType('credit')}
        />

        {/* Credit Terms (show only if credit selected) */}
        {paymentType === 'credit' && (
          <View style={styles.creditSection}>
            <View style={styles.creditHeader}>
              <Text style={styles.creditIcon}>💳</Text>
              <Text style={styles.creditTitle}>Credit Terms</Text>
            </View>

            <DateField
              field={{
                id: 'dueDate',
                name: 'dueDate',
                label: 'Due Date',
                type: FieldType.DATE,
                required: true,
              }}
              value={dueDate.toISOString()}
              onChange={(value: string) => setDueDate(new Date(value))}
              onBlur={() => {}}
            />

            <View style={styles.dueDateInfo}>
              <Text style={styles.dueDateInfoText}>
                Payment due in{' '}
                {Math.ceil(
                  (dueDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{' '}
                days
              </Text>
            </View>

            {/* Quick Due Date Options */}
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
                  setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
                }
              >
                <Text style={styles.quickDueDateText}>15 days</Text>
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

        {/* Notes */}
        <View style={styles.notesSection}>
          <TextAreaField
            field={{
              id: 'notes',
              name: 'notes',
              label: 'Notes (optional)',
              type: FieldType.TEXTAREA,
              numberOfLines: 3,
              placeholder: 'Add any notes about this sale...',
            }}
            value={notes}
            onChange={(value: string) => setNotes(value)}
            onBlur={() => {}}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Complete Sale ✓"
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
  creditSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  creditHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  creditIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  creditTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  dueDateInfo: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  dueDateInfoText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textAlign: 'center' as const,
  },
  quickDueDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickDueDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
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
  notesSection: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default CreditTermsScreen;
