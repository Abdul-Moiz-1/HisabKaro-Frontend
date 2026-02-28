// flows/bankTransfer/screens/DepositScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';


import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import {
  AmountInputField,
  DateField,
  TextAreaField,
} from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'HBL',
    accountTitle: 'Business Account',
    accountNumber: '****1234',
    accountType: 'Normal',
    balance: 250000,
  },
  {
    id: '2',
    bankName: 'Meezan Bank',
    accountTitle: 'Savings Account',
    accountNumber: '****5678',
    accountType: 'Normal',
    balance: 150000,
  },
];

const DepositScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();

  const [amount, setAmount] = useState(0);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  // Mock cash balance
  const cashInHand = 125000;
  const selectedBank = mockBankAccounts.find(b => b.id === selectedBankId);

  const handleDeposit = () => {
    if (!amount || amount <= 0) {
      Alert.alert('Please enter a valid amount');
      return;
    }

    if (!selectedBankId) {
      Alert.alert('Please select a bank account');
      return;
    }

    if (amount > cashInHand) {
      Alert.alert('Insufficient cash in hand');
      return;
    }

    navigateToScreen('Confirmation', {
      transferType: 'deposit',
      amount,
      bankAccount: selectedBank,
      date: date.toISOString(),
      notes,
      cashBefore: cashInHand,
      cashAfter: cashInHand - amount,
      bankBefore: selectedBank?.balance,
      bankAfter: (selectedBank?.balance || 0) + amount,
    });
  };

  const quickAmounts = [
    { label: '10k', value: 10000 },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '100k', value: 100000 },
    { label: 'All', value: cashInHand },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Icon name="wallet" size={24} color="#34C759" />
            <View style={styles.headerInfo}>
              <Text style={styles.headerLabel}>Cash in Hand</Text>
              <Text style={styles.headerValue}>
                PKR {cashInHand.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Section */}
        <Text style={styles.question}>How much to deposit?</Text>

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
          onBlur={() => { }}
        />

        {/* Warning if exceeds cash */}
        {amount > cashInHand && (
          <View style={styles.warningCard}>
            <Icon name="warning" size={20} color="#FF3B30" />
            <Text style={styles.warningText}>
              Amount exceeds available cash in hand
            </Text>
          </View>
        )}

        {/* Bank Account Selection */}
        <Text style={styles.sectionTitle}>Select Bank Account</Text>

        {mockBankAccounts.map(bank => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankCard,
              selectedBankId === bank.id && styles.bankCardSelected,
            ]}
            onPress={() => setSelectedBankId(bank.id)}
          >
            <View style={styles.bankIcon}>
              <Text style={styles.bankIconText}>🏦</Text>
            </View>

            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{bank.bankName}</Text>
              <Text style={styles.accountTitle}>{bank.accountTitle}</Text>
              <Text style={styles.accountNumber}>{bank.accountNumber}</Text>
              <Text style={styles.balance}>
                Balance: PKR {bank.balance.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.radioButton,
                selectedBankId === bank.id && styles.radioButtonSelected,
              ]}
            >
              {selectedBankId === bank.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Date Section */}
        <Text style={styles.sectionTitle}>Deposit Date</Text>

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
              placeholder: 'Add any notes about this deposit...',
              numberOfLines: 3,
              type: FieldType.TEXTAREA,
            }}
            value={notes}
            onChange={setNotes}
            onBlur={() => { }}
          />
        </View>

        {/* Preview */}
        {amount > 0 && selectedBankId && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Transaction Preview</Text>

            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>💵 Cash in Hand</Text>
                <View style={styles.previewChange}>
                  <Text style={styles.previewBefore}>
                    {cashInHand.toLocaleString()}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={styles.previewAfter}>
                    {(cashInHand - amount).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>
                  🏦 {selectedBank?.bankName}
                </Text>
                <View style={styles.previewChange}>
                  <Text style={styles.previewBefore}>
                    {selectedBank?.balance.toLocaleString()}
                  </Text>
                  <Icon name="arrow-forward" size={16} color="#8E8E93" />
                  <Text style={[styles.previewAfter, styles.previewIncrease]}>
                    {((selectedBank?.balance || 0) + amount).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="✓ Deposit to Bank"
          onPress={handleDeposit}
          disabled={!amount || !selectedBankId || amount > cashInHand}
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
  headerCard: {
    backgroundColor: '#34C759' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  headerValue: {
    ...theme.typography.h3,
    color: '#34C759',
    fontWeight: '700' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  warningCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FF3B30' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF3B30',
    fontWeight: '600' as const,
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  bankCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  bankCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  bankIconText: {
    fontSize: 24,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.xs,
  },
  accountTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  accountNumber: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balance: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
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
  previewCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  previewTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  previewRow: {
    gap: theme.spacing.md,
  },
  previewItem: {
    marginBottom: theme.spacing.sm,
  },
  previewLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  previewChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  previewBefore: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  previewAfter: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  previewIncrease: {
    color: '#34C759',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default DepositScreen;
