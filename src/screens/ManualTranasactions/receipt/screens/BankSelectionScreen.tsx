// flows/receipt/screens/BankSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DateField } from '../../../../components/DynamicForm';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockBankAccounts = [
  {
    id: '1',
    bankName: 'HBL',
    accountTitle: 'Business Account',
    accountNumber: '****1234',
    accountType: '',
    balance: 250000,
  },
  {
    id: '2',
    bankName: 'Meezan Bank',
    accountTitle: 'Savings Account',
    accountNumber: '****5678',
    accountType: '',
    balance: 150000,
  },
];

const BankSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [transferDate, setTransferDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleContinue = () => {
    const selectedBank = mockBankAccounts.find(b => b.id === selectedBankId);
    navigateToScreen('Confirmation', {
      bankAccount: selectedBank,
      transferDate: transferDate.toISOString(),
    });
  };

  const handleAddBank = () => {
    navigateToScreen('AddBankAccount');
  };

  const quickDateOptions = [
    { label: 'Today', date: new Date() },
    {
      label: 'Yesterday',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Bank Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Which bank account?</Text>

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

          <TouchableOpacity
            style={styles.addBankButton}
            onPress={handleAddBank}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addBankButtonText}>+ Add bank account</Text>
          </TouchableOpacity>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When did money arrive?</Text>

          {/* Quick Date Options */}
          <View style={styles.quickDateButtons}>
            {quickDateOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickDateButton}
                onPress={() => setTransferDate(option.date)}
              >
                <Text style={styles.quickDateButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.quickDateButtonText}>Pick date</Text>
            </TouchableOpacity>
          </View>

          <DateField
            field={{
              id: 'date',
              name: 'date',
              label: 'Transfer Date',
              type: FieldType.DATE,
            }}
            value={transferDate.toDateString()}
            onChange={date => setTransferDate(new Date(date))}
            onBlur={() => {}}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!selectedBankId}
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
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
  addBankButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addBankButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  quickDateButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickDateButtonText: {
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

export default BankSelectionScreen;
