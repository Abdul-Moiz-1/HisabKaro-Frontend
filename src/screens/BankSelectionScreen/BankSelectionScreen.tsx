// screens/BankSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useDynamicForm } from '../../hooks/useDynamicForm';
import { bankSelectionConfig } from '../../config/forms/bankSelection';
import DynamicFormField from '../../components/DynamicForm/DynamicFormField';
import { Theme, useThemedStyles } from '../../theme';

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  balance: number;
}

// Mock data - replace with API
const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'HBL',
    accountTitle: 'Business Account',
    accountNumber: '****1234',
    balance: 250000,
  },
  {
    id: '2',
    bankName: 'Meezan Bank',
    accountTitle: 'Savings Account',
    accountNumber: '****5678',
    balance: 150000,
  },
];

const BankSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useThemedStyles(createStyles);

  // @ts-ignore
  const { customer, amount, remaining } = route.params;

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const { formData, errors, touched, handleChange, handleBlur, validateForm } =
    useDynamicForm(bankSelectionConfig);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    // TODO: Replace with API call
    setBankAccounts(mockBankAccounts);
  };

  const handleBankSelect = (bankId: string) => {
    handleChange('bankAccount', bankId);
  };

  const handleDateSelect = (date: string) => {
    handleChange('transferDate', date);

    // Auto-navigate if both bank and date are selected
    if (formData.bankAccount && date) {
      handleContinue();
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      const selectedBank = bankAccounts.find(
        b => b.id === formData.bankAccount,
      );

      // @ts-ignore
      navigation.navigate('Confirmation', {
        customer,
        amount,
        remaining,
        paymentMethod: 'bank',
        bankAccount: selectedBank,
        transferDate: formData.transferDate,
      });
    }
  };

  const renderBankAccount = ({ item }: { item: BankAccount }) => (
    <TouchableOpacity
      style={[
        styles.bankCard,
        formData.bankAccount === item.id && styles.bankCardSelected,
      ]}
      onPress={() => handleBankSelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.bankIcon}>
        <Text style={styles.bankIconText}>🏦</Text>
      </View>

      <View style={styles.bankInfo}>
        <Text style={styles.bankName}>{item.bankName}</Text>
        <Text style={styles.accountTitle}>{item.accountTitle}</Text>
        <Text style={styles.accountNumber}>{item.accountNumber}</Text>
        <Text style={styles.balance}>
          Balance: PKR {item.balance.toLocaleString()}
        </Text>
      </View>

      <View
        style={[
          styles.radioButton,
          formData.bankAccount === item.id && styles.radioButtonSelected,
        ]}
      >
        {formData.bankAccount === item.id && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Transfer</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Which bank account?</Text>

        <FlatList
          data={bankAccounts}
          keyExtractor={item => item.id}
          renderItem={renderBankAccount}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('AddBankAccount');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add bank account</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.dateQuestion}>When did money arrive?</Text>

        <DynamicFormField
          field={bankSelectionConfig.sections[1].fields[0]}
          value={formData.transferDate}
          error={errors.transferDate}
          touched={touched.transferDate}
          onChange={handleDateSelect}
          onBlur={() => handleBlur('transferDate')}
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
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  question: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
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
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.lg,
  },
  dateQuestion: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
});

export default BankSelectionScreen;
