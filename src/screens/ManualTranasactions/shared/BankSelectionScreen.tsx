// shared/BankSelectionScreen.tsx
// Reusable bank account selection screen for both Sales and Receipt flows
import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchActiveBankAccounts,
  setSelectedAccount,
} from '../../../store/slices/bankAccountsSlice';
import { setPaymentMethod, setNotes } from '../../../store/slices/salesSlice';
import { DateField } from '../../../components/DynamicForm';
import ActionButton from '../../../components/common/ActionButton';
import { FieldType } from '../../../types/forms';
import Icon from '../../../components/Icon';

// Bank selection schema
const bankSelectionSchema = z.object({
  bankAccountId: z.string().min(1, 'Please select a bank account'),
  transferDate: z.string().optional(),
});

type BankSelectionFormValues = z.infer<typeof bankSelectionSchema>;

type RouteParams = {
  BankSelection: {
    flowType: 'sales' | 'receipt';
    nextScreen?: string;
  };
};

const BankSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BankSelection'>>();
  const dispatch = useAppDispatch();

  const { flowType = 'sales', nextScreen = 'Confirmation' } = route.params || {};

  const { activeAccounts, isLoading } = useAppSelector((state) => state.bankAccounts);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch active bank accounts on mount
  useEffect(() => {
    dispatch(fetchActiveBankAccounts());
  }, [dispatch]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BankSelectionFormValues>({
    resolver: zodResolver(bankSelectionSchema),
    mode: 'onChange',
    defaultValues: {
      transferDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedBankId = watch('bankAccountId');
  const transferDate = watch('transferDate');

  const selectedBank = useMemo(
    () => activeAccounts.find((b) => b.id === selectedBankId),
    [activeAccounts, selectedBankId]
  );

  const handleContinue = useCallback(
    (data: BankSelectionFormValues) => {
      const bank = activeAccounts.find((b) => b.id === data.bankAccountId);
      if (!bank) return;

      // Update Redux state
      dispatch(setSelectedAccount(bank));
      dispatch(setPaymentMethod('bank'));

      // Navigate to next screen
      // @ts-ignore
      navigation.navigate(nextScreen, {
        flowType,
        bankAccount: bank,
        transferDate: data.transferDate,
      });
    },
    [activeAccounts, dispatch, navigation, nextScreen, flowType]
  );

  const handleAddBank = useCallback(() => {
    // @ts-ignore
    navigation.navigate('AddBankAccount');
  }, [navigation]);

  const quickDateOptions = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ];

  const handleQuickDate = useCallback(
    (date: Date) => {
      setValue('transferDate', date.toISOString().split('T')[0], {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading bank accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bank Account Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Which bank account?</Text>

          {activeAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyText}>No bank accounts found</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddBank}>
                <Text style={styles.addButtonText}>+ Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Controller
              control={control}
              name="bankAccountId"
              render={({ field: { onChange, value } }) => (
                <>
                  {activeAccounts.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      style={[
                        styles.bankCard,
                        value === bank.id && styles.bankCardSelected,
                      ]}
                      onPress={() => onChange(bank.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.bankIcon}>
                        <Text style={styles.bankIconText}>🏦</Text>
                      </View>

                      <View style={styles.bankInfo}>
                        <View style={styles.bankHeader}>
                          <Text style={styles.bankName}>{bank.bank_name}</Text>
                          {bank.is_default && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.accountNumber}>
                          {bank.account_number.slice(-4).padStart(bank.account_number.length, '*')}
                        </Text>
                        <Text style={styles.accountType}>{bank.account_type}</Text>
                        <Text style={styles.balance}>
                          Balance: PKR {bank.current_balance.toLocaleString()}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioButton,
                          value === bank.id && styles.radioButtonSelected,
                        ]}
                      >
                        {value === bank.id && <View style={styles.radioButtonInner} />}
                      </View>
                    </TouchableOpacity>
                  ))}

                  {errors.bankAccountId && (
                    <Text style={styles.errorText}>{errors.bankAccountId.message}</Text>
                  )}
                </>
              )}
            />
          )}

          {activeAccounts.length > 0 && (
            <TouchableOpacity
              style={styles.addBankButton}
              onPress={handleAddBank}
              activeOpacity={0.7}
            >
              <Icon name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.addBankButtonText}>+ Add bank account</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transfer Date (for receipt flow) */}
        {flowType === 'receipt' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When did money arrive?</Text>

            {/* Quick Date Options */}
            <View style={styles.quickDateButtons}>
              {quickDateOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickDateButton}
                  onPress={() => handleQuickDate(option.date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickDateButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Text style={styles.quickDateButtonText}>Pick date</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="transferDate"
              render={({ field: { onChange, value } }) => (
                <DateField
                  field={{
                    id: 'date',
                    name: 'date',
                    label: 'Transfer Date',
                    type: FieldType.DATE,
                  }}
                  value={value || ''}
                  onChange={onChange}
                  onBlur={() => {}}
                />
              )}
            />
          </View>
        )}

        {/* Selected Bank Summary */}
        {selectedBank && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Selected Account</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bank</Text>
              <Text style={styles.summaryValue}>{selectedBank.bank_name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Account</Text>
              <Text style={styles.summaryValue}>
                {selectedBank.account_number.slice(-4).padStart(selectedBank.account_number.length, '*')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                PKR {selectedBank.current_balance.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    emptyIcon: {
      fontSize: 48,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    addButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
    },
    addButtonText: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    bankCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    bankCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    bankIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    bankIconText: {
      fontSize: 24,
    },
    bankInfo: {
      flex: 1,
    },
    bankHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    bankName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '700',
    },
    defaultBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    defaultBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    accountNumber: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    accountType: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      textTransform: 'capitalize',
    },
    balance: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    addBankButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    quickDateButtons: {
      flexDirection: 'row',
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
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
    },
    quickDateButtonText: {
      fontSize: 12,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    summaryTitle: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default BankSelectionScreen;
