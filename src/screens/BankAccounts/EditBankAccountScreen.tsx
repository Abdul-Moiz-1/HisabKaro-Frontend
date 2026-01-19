import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import {
  bankAccountsApi,
  UpdateBankAccountPayload,
  BankAccount,
} from '../../services/api';
import {
  editBankAccountSchema,
  EditBankAccountFormData,
} from './schemas/bankAccountSchemas';
import {
  TextInputField,
  TextAreaField,
  CheckboxField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';
import { formatCurrency } from '../../utils';

interface EditBankAccountScreenProps
  extends NavigationProps<'EditBankAccount'> {
  route: {
    params: {
      accountId: string;
    };
  };
}

const EditBankAccountScreen: React.FC<EditBankAccountScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { accountId } = route.params;

  // Loading state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account data
  const [account, setAccount] = useState<BankAccount | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<EditBankAccountFormData>({
    resolver: zodResolver(editBankAccountSchema),
    defaultValues: {
      accountTitle: '',
    },
    mode: 'onChange',
  });

  // Fetch account data on mount
  useEffect(() => {
    fetchAccountData();
  }, [accountId]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const { data: accountData } = await bankAccountsApi.getById(accountId);
      console.log(accountData);
      setAccount(accountData);

      // Populate form fields using reset
      reset({
        bankId: accountData.bank.id,
        accountTitle: accountData.accountTitle,
        accountNumber: accountData.accountNumber,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load account data',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle save account with React Hook Form
  const onSubmit = async (data: EditBankAccountFormData) => {
    try {
      setIsSubmitting(true);

      const payload: UpdateBankAccountPayload = {
        accountTitle: data.accountTitle.trim(),
      };

      const { data: updatedAccount } = await bankAccountsApi.update(
        accountId,
        payload,
      );

      Toast.show({
        type: 'success',
        text1: 'Account Updated',
        text2: `${updatedAccount.bank.name} account has been updated successfully`,
      });

      // Navigate back to account detail
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading account data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>ℹ️</Text>
            <Text style={styles.infoBannerText}>
              You can edit account details but cannot change the account number.
              Contact support for account number changes.
            </Text>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏦</Text>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <Controller
              control={control}
              name="accountTitle"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'accountTitle',
                    name: 'accountTitle',
                    label: 'Account Title / Name',
                    type: FieldType.TEXT,
                    placeholder: 'Enter account holder name',
                    required: true,
                  }}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.accountTitle?.message}
                />
              )}
            />
          </View>

          {/* Read-only Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📊</Text>
              <Text style={styles.sectionTitle}>Read-only Information</Text>
            </View>

            <View style={styles.readOnlyCard}>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Bank Name</Text>
                <Text style={styles.readOnlyValue}>{account?.bank?.name}</Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Account Number</Text>
                <Text style={styles.readOnlyValue}>
                  {account?.accountNumber}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Account Type</Text>
                <Text style={styles.readOnlyValue}>
                  {account?.accountType?.charAt(0).toUpperCase() +
                    (account?.accountType?.slice(1) || '')}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Current Balance</Text>
                <Text style={styles.readOnlyValue}>
                  {formatCurrency(account?.currentBalance)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <View style={styles.buttonHalf}>
              <ActionButton
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                disabled={isSubmitting}
              />
            </View>
            <View style={styles.buttonHalf}>
              <ActionButton
                title={isSubmitting ? 'Updating...' : '✓ Update Account'}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                disabled={!isDirty || !isValid || isSubmitting}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.info}15`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.info,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    infoBannerIcon: {
      fontSize: 18,
      marginRight: theme.spacing.sm,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionIcon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    readOnlyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    readOnlyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    readOnlyDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
    readOnlyLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    readOnlyValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
      flex: 1,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    buttonHalf: {
      flex: 1,
    },
  });

export default EditBankAccountScreen;
