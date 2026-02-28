import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { BankIcon, XIcon } from 'phosphor-react-native';

import { useTheme } from '../../../store/hooks';
import { bankAccountsApi, CreateBankAccountPayload, BankAccountType } from '../../../services/api/bankAccounts';
import Button from '../../../components/common/Button';
import Input from '../../../components/forms/Input';

// Zod Schema
const bankAccountSchema = z.object({
  bank_name: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name is too long'),
  account_title: z
    .string()
    .min(3, 'Account title must be at least 3 characters')
    .max(100, 'Account title is too long'),
  account_number: z
    .string()
    .min(10, 'Account number must be at least 10 digits')
    .max(25, 'Account number is too long')
    .regex(/^[0-9]+$/, 'Account number must contain only digits'),
  account_type: z.enum(['savings', 'current', 'business', 'other'], {
    required_error: 'Please select account type',
  }),
  opening_balance: z
    .number()
    .min(0, 'Opening balance cannot be negative')
    .optional(),
  branch_name: z.string().max(100, 'Branch name is too long').optional(),
  branch_code: z.string().max(20, 'Branch code is too long').optional(),
  iban: z
    .string()
    .max(34, 'IBAN is too long')
    .regex(/^[A-Z0-9]*$/, 'IBAN must contain only uppercase letters and numbers')
    .optional()
    .or(z.literal('')),
  is_default: z.boolean().optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

type RouteParams = {
  AddBankAccount: {
    flowType?: 'sales' | 'receipt' | 'standalone';
    nextScreen?: string;
  };
};

// Pakistani Bank Options
const PAKISTAN_BANKS = [
  'HBL (Habib Bank Limited)',
  'Meezan Bank',
  'Bank Alfalah',
  'UBL (United Bank Limited)',
  'MCB (Muslim Commercial Bank)',
  'Allied Bank',
  'Faysal Bank',
  'Standard Chartered',
  'JS Bank',
  'Soneri Bank',
  'Bank Al Habib',
  'Askari Bank',
  'National Bank of Pakistan',
  'Dubai Islamic Bank',
  'Bank of Punjab',
  'Samba Bank',
  'Summit Bank',
  'Silk Bank',
  'Other',
];

const ACCOUNT_TYPES: { label: string; value: BankAccountType }[] = [
  { label: 'Savings Account', value: 'savings' },
  { label: 'Current Account', value: 'current' },
  { label: 'Business Account', value: 'business' },
  { label: 'Other', value: 'other' },
];

const AddBankAccountScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AddBankAccount'>>();

  const flowType = route.params?.flowType || 'standalone';
  const nextScreen = route.params?.nextScreen || 'BankSelection';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    mode: 'onChange',
    defaultValues: {
      bank_name: '',
      account_title: '',
      account_number: '',
      account_type: 'current',
      opening_balance: 0,
      branch_name: '',
      branch_code: '',
      iban: '',
      is_default: false,
      notes: '',
    },
  });

  const selectedBank = watch('bank_name');
  const selectedAccountType = watch('account_type');

  const handleSaveBankAccount = useCallback(
    async (data: BankAccountFormValues) => {
      try {
        setIsSubmitting(true);

        const payload: CreateBankAccountPayload = {
          bank_name: data.bank_name.trim(),
          account_title: data.account_title.trim(),
          account_number: data.account_number.trim(),
          account_type: data.account_type,
          opening_balance: data.opening_balance || 0,
          branch_name: data.branch_name?.trim() || undefined,
          branch_code: data.branch_code?.trim() || undefined,
          iban: data.iban?.trim() || undefined,
          is_default: data.is_default || false,
          notes: data.notes?.trim() || undefined,
        };

        const newBankAccount = await bankAccountsApi.create(payload);

        Toast.show({
          type: 'success',
          text1: 'Bank Account Added',
          text2: `${newBankAccount.account_title} has been added successfully`,
        });

        if (flowType === 'standalone') {
          navigation.goBack();
        } else {
          // @ts-ignore
          navigation.navigate(nextScreen, { newBankAccount });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to create bank account',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [flowType, navigation, nextScreen]
  );

  const renderBankPicker = () => {
    if (!showBankPicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankPicker(false)}>
              <XIcon size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerScroll}>
            {PAKISTAN_BANKS.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[
                  styles.pickerOption,
                  selectedBank === bank && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setValue('bank_name', bank, { shouldValidate: true });
                  setShowBankPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedBank === bank && styles.pickerOptionTextSelected,
                  ]}
                >
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderTypePicker = () => {
    if (!showTypePicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Account Type</Text>
            <TouchableOpacity onPress={() => setShowTypePicker(false)}>
              <XIcon size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerScroll}>
            {ACCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.pickerOption,
                  selectedAccountType === type.value && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setValue('account_type', type.value, { shouldValidate: true });
                  setShowTypePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedAccountType === type.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BankIcon size={32} color={theme.colors.primary} weight="fill" />
            </View>
            <Text style={styles.headerTitle}>Add Bank Account</Text>
            <Text style={styles.headerSubtitle}>
              Add a new bank account for transactions
            </Text>
          </View>

          {/* Bank Name */}
          <Controller
            control={control}
            name="bank_name"
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowBankPicker(true)}
              >
                <Text style={styles.label}>
                  Bank Name <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.pickerInput,
                    errors.bank_name && styles.inputError,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerInputText,
                      !value && styles.pickerPlaceholder,
                    ]}
                  >
                    {value || 'Select bank'}
                  </Text>
                </View>
                {errors.bank_name && (
                  <Text style={styles.errorText}>{errors.bank_name.message}</Text>
                )}
              </TouchableOpacity>
            )}
          />

          {/* Account Title */}
          <Controller
            control={control}
            name="account_title"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Account Title"
                  placeholder="Enter account title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.account_title?.message}
                  required
                />
              </View>
            )}
          />

          {/* Account Number */}
          <Controller
            control={control}
            name="account_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Account Number"
                  placeholder="Enter account number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  error={errors.account_number?.message}
                  required
                />
              </View>
            )}
          />

          {/* Account Type */}
          <Controller
            control={control}
            name="account_type"
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowTypePicker(true)}
              >
                <Text style={styles.label}>
                  Account Type <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.pickerInput,
                    errors.account_type && styles.inputError,
                  ]}
                >
                  <Text style={styles.pickerInputText}>
                    {ACCOUNT_TYPES.find((t) => t.value === value)?.label ||
                      'Select type'}
                  </Text>
                </View>
                {errors.account_type && (
                  <Text style={styles.errorText}>{errors.account_type.message}</Text>
                )}
              </TouchableOpacity>
            )}
          />

          {/* Opening Balance */}
          <Controller
            control={control}
            name="opening_balance"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Opening Balance"
                  placeholder="0"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  error={errors.opening_balance?.message}
                />
              </View>
            )}
          />

          {/* Branch Name */}
          <Controller
            control={control}
            name="branch_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Branch Name"
                  placeholder="Enter branch name (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.branch_name?.message}
                />
              </View>
            )}
          />

          {/* Branch Code */}
          <Controller
            control={control}
            name="branch_code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Branch Code"
                  placeholder="Enter branch code (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.branch_code?.message}
                />
              </View>
            )}
          />

          {/* IBAN */}
          <Controller
            control={control}
            name="iban"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="IBAN"
                  placeholder="PK36XXXXXXXXXXXXXXXXXXXX (optional)"
                  value={value}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                  error={errors.iban?.message}
                />
              </View>
            )}
          />

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Input
                  label="Notes"
                  placeholder="Additional notes (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  error={errors.notes?.message}
                />
              </View>
            )}
          />

          {/* Set as Default */}
          <Controller
            control={control}
            name="is_default"
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setValue('is_default', !value)}
              >
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default account</Text>
              </TouchableOpacity>
            )}
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              This account will be available for all transactions. You can manage
              your accounts from Settings.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isSubmitting ? 'Saving...' : 'Save Account'}
            onPress={handleSubmit(handleSaveBankAccount)}
            variant="primary"
            disabled={!isValid || isSubmitting}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Pickers */}
      {renderBankPicker()}
      {renderTypePicker()}
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: 100,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    required: {
      color: theme.colors.error,
    },
    pickerInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    pickerInputText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    pickerPlaceholder: {
      color: theme.colors.text.disabled,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 6,
      marginRight: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxCheck: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    checkboxLabel: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    cancelButton: {
      flex: 1,
    },
    saveButton: {
      flex: 1,
    },
    pickerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '70%',
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    pickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    pickerScroll: {
      maxHeight: 400,
    },
    pickerOption: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    pickerOptionSelected: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    pickerOptionText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    pickerOptionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

export default AddBankAccountScreen;
