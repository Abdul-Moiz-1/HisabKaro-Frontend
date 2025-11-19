// flows/receipt/screens/AddBankAccountScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { Theme } from '../../../../constants/theme';
import ActionButton from '../../../../components/common/ActionButton';
import {
  AmountInputField,
  DropdownField,
  NumberInputField,
  TextInputField,
} from '../../../../components/DynamicForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FieldType } from '../../../../types/forms';

interface FormData {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  accountType: string;
  openingBalance: string;
  branchName: string;
}
type FormFieldKey = keyof FormData;
const AddBankAccountScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen, goBack } = useFlowNavigation();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    accountType: '',
    openingBalance: '0',
    branchName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'bankName':
        if (!value.trim()) {
          error = 'Bank name is required';
        }
        break;

      case 'accountTitle':
        if (!value.trim()) {
          error = 'Account title is required';
        } else if (value.length < 3) {
          error = 'Account title must be at least 3 characters';
        }
        break;

      case 'accountNumber':
        if (!value.trim()) {
          error = 'Account number is required';
        } else if (value.length < 10) {
          error = 'Account number must be at least 10 digits';
        } else if (value.length > 20) {
          error = 'Account number must not exceed 20 digits';
        }
        break;

      case 'accountType':
        if (!value.trim()) {
          error = 'Account type is required';
        }
        break;

      case 'openingBalance':
        if (parseFloat(value) < 0) {
          error = 'Opening balance cannot be negative';
        }
        break;
    }

    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: FormFieldKey) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<FormFieldKey, string>> = {};

    (
      [
        'bankName',
        'accountTitle',
        'accountNumber',
        'accountType',
        'openingBalance',
      ] as FormFieldKey[]
    ).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      bankName: true,
      accountTitle: true,
      accountNumber: true,
      accountType: true,
      openingBalance: true,
      branchName: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Create bank account object
      const newBankAccount = {
        id: Date.now().toString(),
        bankName: formData.bankName,
        accountTitle: formData.accountTitle,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        balance: parseFloat(formData.openingBalance),
        branchName: formData.branchName,
        last4: formData.accountNumber.slice(-4),
        createdAt: new Date().toISOString(),
      };

      // Navigate back to bank selection with new account
      navigateToScreen('BankSelection', { newBankAccount });
    }
  };

  // Bank options - can be fetched from API
  const bankOptions = [
    { label: 'HBL (Habib Bank Limited)', value: 'HBL' },
    { label: 'Meezan Bank', value: 'Meezan Bank' },
    { label: 'Bank Alfalah', value: 'Bank Alfalah' },
    { label: 'UBL (United Bank Limited)', value: 'UBL' },
    { label: 'MCB (Muslim Commercial Bank)', value: 'MCB' },
    { label: 'Allied Bank', value: 'Allied Bank' },
    { label: 'Faysal Bank', value: 'Faysal Bank' },
    { label: 'Standard Chartered', value: 'Standard Chartered' },
    { label: 'JS Bank', value: 'JS Bank' },
    { label: 'Soneri Bank', value: 'Soneri Bank' },
    { label: 'Bank Al Habib', value: 'Bank Al Habib' },
    { label: 'Askari Bank', value: 'Askari Bank' },
    { label: 'National Bank of Pakistan', value: 'NBP' },
    { label: 'Other', value: 'Other' },
  ];

  const accountTypeOptions = [
    { label: 'Current Account', value: 'current' },
    { label: 'Savings Account', value: 'savings' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Bank Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏦</Text>
              <Text style={styles.sectionTitle}>Bank Account Details</Text>
            </View>

            <DropdownField
              field={{
                id: 'bankName',
                name: 'bankName',
                label: 'Bank Name',
                type: FieldType.DROPDOWN,
                placeholder: 'Select bank',
                options: bankOptions,
                required: true,
              }}
              value={formData.bankName}
              onChange={value => handleFieldChange('bankName', value)}
              onBlur={() => handleFieldBlur('bankName')}
              error={touched.bankName ? errors.bankName : undefined}
            />

            <TextInputField
              field={{
                id: 'accountTitle',
                name: 'accountTitle',
                label: 'Account Title',
                type: FieldType.TEXT,
                required: true,
                placeholder: 'Enter account title',
              }}
              value={formData.accountTitle}
              onChange={value => handleFieldChange('accountTitle', value)}
              onBlur={() => handleFieldBlur('accountTitle')}
              error={touched.accountTitle ? errors.accountTitle : undefined}
            />

            <NumberInputField
              field={{
                id: 'accountNumber',
                name: 'accountNumber',
                label: 'Account Number',
                type: FieldType.NUMBER,
                required: true,
                placeholder: 'Enter account number',
                maxLength: 20,
              }}
              value={formData.accountNumber}
              onChange={value => handleFieldChange('accountNumber', value)}
              onBlur={() => handleFieldBlur('accountNumber')}
              error={touched.accountNumber ? errors.accountNumber : undefined}
            />

            <DropdownField
              field={{
                id: 'accountType',
                name: 'accountType',
                label: 'Account Type',
                type: FieldType.DROPDOWN,
                placeholder: 'Select account type',
                options: accountTypeOptions,
                required: true,
              }}
              value={formData.accountType}
              onChange={value => handleFieldChange('accountType', value)}
              onBlur={() => handleFieldBlur('accountType')}
              error={touched.accountType ? errors.accountType : undefined}
            />

            <AmountInputField
              field={{
                id: 'openingBalance',
                name: 'openingBalance',
                label: 'Opening Balance',
                type: FieldType.AMOUNT,
                required: true,
                placeholder: '0',
                suffix: 'PKR',
                hint: 'Current balance in this account',
              }}
              value={formData.openingBalance}
              onChange={value => handleFieldChange('openingBalance', value)}
              onBlur={() => handleFieldBlur('openingBalance')}
              error={touched.openingBalance ? errors.openingBalance : undefined}
            />

            <TextInputField
              field={{
                id: 'branchName',
                name: 'branchName',
                label: 'Branch Name/Code',
                type: FieldType.TEXT,
                placeholder: 'Enter branch name or code (optional)',
              }}
              value={formData.branchName}
              onChange={value => handleFieldChange('branchName', value)}
              onBlur={() => handleFieldBlur('branchName')}
              error={touched.branchName ? errors.branchName : undefined}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              This account will be available for all future transactions. You
              can manage your accounts from Settings.
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <View style={styles.footerButton}>
              <ActionButton title="Cancel" onPress={goBack} variant="outline" />
            </View>
            <View style={styles.footerButton}>
              <ActionButton
                title="✓ Save Account"
                onPress={handleSubmit}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
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
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButtons: {
    flexDirection: 'row' as const,
    width: '100%' as const,
    gap: theme.spacing.sm,
  },
  footerButton: {
    flex: 1 as const,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default AddBankAccountScreen;
