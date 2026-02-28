// screens/transactions/TransactionFilterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Icon from '../../components/Icon';
import { useThemedStyles } from '../../theme';
import { DateField } from '../../components/DynamicForm';
import { FieldType } from '../../types/forms';
import ActionButton from '../../components/common/ActionButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

const TransactionFilterScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const transactionTypes = [
    { value: 'receipt', label: 'Receipt', icon: '📥' },
    { value: 'sale', label: 'Sale', icon: '🛒' },
    { value: 'purchase', label: 'Purchase', icon: '🛍️' },
    { value: 'expense', label: 'Expense', icon: '📝' },
    { value: 'transfer', label: 'Transfer', icon: '🔄' },
    { value: 'payment', label: 'Payment', icon: '💸' },
  ];

  const statuses = [
    { value: 'completed', label: 'Completed', color: '#34C759' },
    { value: 'pending', label: 'Pending', color: '#FF9500' },
    { value: 'partial', label: 'Partial', color: '#007AFF' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'wallet', label: 'Mobile Wallet' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'card', label: 'Card' },
  ];

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (val: string[]) => void,
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedPaymentMethods([]);
    setDateFrom(null);
    setDateTo(null);
    setAmountMin('');
    setAmountMax('');
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Transaction Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Type</Text>
          <View style={styles.chipContainer}>
            {transactionTypes.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chip,
                  selectedTypes.includes(type.value) && styles.chipSelected,
                ]}
                onPress={() =>
                  toggleSelection(type.value, selectedTypes, setSelectedTypes)
                }
              >
                <Text style={styles.chipIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    selectedTypes.includes(type.value) &&
                    styles.chipTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipContainer}>
            {statuses.map(status => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.chip,
                  selectedStatuses.includes(status.value) && {
                    backgroundColor: status.color + '20',
                    borderColor: status.color,
                  },
                ]}
                onPress={() =>
                  toggleSelection(
                    status.value,
                    selectedStatuses,
                    setSelectedStatuses,
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedStatuses.includes(status.value) && {
                      color: status.color,
                    },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.chipContainer}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.chip,
                  selectedPaymentMethods.includes(method.value) &&
                  styles.chipSelected,
                ]}
                onPress={() =>
                  toggleSelection(
                    method.value,
                    selectedPaymentMethods,
                    setSelectedPaymentMethods,
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedPaymentMethods.includes(method.value) &&
                    styles.chipTextSelected,
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DateField
                field={{
                  id: 'fromDate',
                  name: 'fromDate',
                  label: 'From',
                  type: FieldType.DATE,
                }}
                value={dateFrom?.toISOString() || new Date().toISOString()}
                onChange={(value: string) => setDateFrom(new Date(value))}
                onBlur={() => { }}
              />
            </View>
            <View style={styles.dateField}>
              <DateField
                field={{
                  id: 'toDate',
                  name: 'toDate',
                  label: 'To',
                  type: FieldType.DATE,
                }}
                value={dateTo?.toISOString() || new Date().toISOString()}
                onChange={(value: string) => setDateTo(new Date(value))}
                onBlur={() => { }}
              />
            </View>
          </View>

          {/* Quick Date Filters */}
          <View style={styles.quickDates}>
            <TouchableOpacity style={styles.quickDateButton}>
              <Text style={styles.quickDateText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDateButton}>
              <Text style={styles.quickDateText}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDateButton}>
              <Text style={styles.quickDateText}>This Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Range</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <Text style={styles.amountLabel}>Min</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currency}>PKR</Text>
                <Text style={styles.amountInput}>{amountMin || '0'}</Text>
              </View>
            </View>
            <Text style={styles.amountSeparator}>to</Text>
            <View style={styles.amountField}>
              <Text style={styles.amountLabel}>Max</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currency}>PKR</Text>
                <Text style={styles.amountInput}>{amountMax || '∞'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
        <View style={styles.footerSpacer} />
        <ActionButton title="Apply Filters" onPress={handleApplyFilters} />
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  chipContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
  dateRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateField: {
    flex: 1,
  },
  quickDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickDateText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  amountRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  amountField: {
    flex: 1,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  currency: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  amountInput: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  amountSeparator: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    paddingTop: 20,
  },
  footer: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  clearButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  clearButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default TransactionFilterScreen;
