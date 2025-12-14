// flows/accountTransfer/screens/DestinationAccountSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateField, TextAreaField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

interface Account {
  id: string;
  type: 'bank' | 'cash' | 'wallet';
  name: string;
  balance: number;
  details?: string;
  icon: string;
  color: string;
}

const mockAccounts: Account[] = [
  {
    id: 'cash',
    type: 'cash',
    name: 'Cash in Hand',
    balance: 125000,
    icon: 'wallet',
    color: '#34C759',
  },
  {
    id: 'bank1',
    type: 'bank',
    name: 'HBL Business Account',
    balance: 250000,
    details: '****1234',
    icon: 'business',
    color: '#007AFF',
  },
  {
    id: 'bank2',
    type: 'bank',
    name: 'Meezan Bank Savings',
    balance: 150000,
    details: '****5678',
    icon: 'business',
    color: '#5856D6',
  },
  {
    id: 'jazzcash',
    type: 'wallet',
    name: 'JazzCash',
    balance: 45000,
    details: '0300-1234567',
    icon: 'phone-portrait',
    color: '#FF3B30',
  },
  {
    id: 'easypaisa',
    type: 'wallet',
    name: 'Easypaisa',
    balance: 32000,
    details: '0321-9876543',
    icon: 'phone-portrait',
    color: '#34C759',
  },
];

const DestinationAccountSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { sourceAccount, amount } = route.params?.flowData || {};

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  // Filter out source account
  const availableAccounts = mockAccounts.filter(
    acc => acc.id !== sourceAccount?.id,
  );

  const selectedAccount = availableAccounts.find(
    acc => acc.id === selectedAccountId,
  );

  const handleTransfer = () => {
    if (!selectedAccountId) {
      Alert.alert('Please select a destination account');
      return;
    }

    navigateToScreen('Confirmation', {
      destinationAccount: selectedAccount,
      date: date.toISOString(),
      notes,
    });
  };

  const renderAccount = (account: Account) => (
    <TouchableOpacity
      key={account.id}
      style={[
        styles.accountCard,
        selectedAccountId === account.id && styles.accountCardSelected,
      ]}
      onPress={() => setSelectedAccountId(account.id)}
    >
      <View
        style={[styles.accountIcon, { backgroundColor: account.color + '20' }]}
      >
        <Icon name={account.icon as any} size={24} color={account.color} />
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{account.name}</Text>
        {account.details && (
          <Text style={styles.accountDetails}>{account.details}</Text>
        )}
        <Text style={styles.accountBalance}>
          Current: PKR {account.balance.toLocaleString()}
        </Text>
        {selectedAccountId === account.id && (
          <Text style={styles.accountBalanceAfter}>
            After: PKR {(account.balance + amount).toLocaleString()}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.radioButton,
          selectedAccountId === account.id && styles.radioButtonSelected,
        ]}
      >
        {selectedAccountId === account.id && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Transfer Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Icon name="arrow-up-circle" size={20} color="#FF3B30" />
              <Text style={styles.summaryLabel}>From</Text>
              <Text style={styles.summaryValue}>{sourceAccount?.name}</Text>
            </View>
            <Icon name="swap-horizontal" size={24} color="#8E8E93" />
            <View style={styles.summaryItem}>
              <Icon name="arrow-down-circle" size={20} color="#34C759" />
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryAmount}>
                PKR {amount?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>Transfer to which account?</Text>

        {/* Cash Section */}
        {availableAccounts.some(acc => acc.type === 'cash') && (
          <>
            <Text style={styles.sectionTitle}>Cash</Text>
            {availableAccounts
              .filter(acc => acc.type === 'cash')
              .map(account => renderAccount(account))}
          </>
        )}

        {/* Bank Accounts Section */}
        {availableAccounts.some(acc => acc.type === 'bank') && (
          <>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            {availableAccounts
              .filter(acc => acc.type === 'bank')
              .map(account => renderAccount(account))}
          </>
        )}

        {/* Mobile Wallets Section */}
        {availableAccounts.some(acc => acc.type === 'wallet') && (
          <>
            <Text style={styles.sectionTitle}>Mobile Wallets</Text>
            {availableAccounts
              .filter(acc => acc.type === 'wallet')
              .map(account => renderAccount(account))}
          </>
        )}

        {/* Date Section */}
        <Text style={styles.sectionTitle}>Transfer Date</Text>

        <View style={styles.quickDates}>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date())}
          >
            <Text style={styles.quickDateText}>📅 Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date(Date.now() - 24 * 60 * 60 * 1000))}
          >
            <Text style={styles.quickDateText}>Yesterday</Text>
          </TouchableOpacity>
        </View>

        <DateField
          field={{
            id: 'date',
            name: 'date',
            label: '',
            type: FieldType.DATE,
          }}
          value={date.toISOString()}
          onChange={(value: string) => setDate(new Date(value))}
          onBlur={() => { }}
        />

        {/* Notes */}
        <View style={styles.notesSection}>
          <TextAreaField
            field={{
              id: 'notes',
              name: 'notes',
              label: 'Notes (optional)',
              type: FieldType.TEXTAREA,
              placeholder: 'Add any notes about this transfer...',
              numberOfLines: 3,
            }}
            value={notes}
            onChange={setNotes}
            onBlur={() => { }}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="✓ Complete Transfer"
          onPress={handleTransfer}
          disabled={!selectedAccountId}
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
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  summaryValue: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  summaryAmount: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  accountCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  accountCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  accountDetails: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  accountBalance: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  accountBalanceAfter: {
    ...theme.typography.caption,
    color: '#34C759',
    fontWeight: '700' as const,
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  quickDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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

export default DestinationAccountSelectionScreen;
