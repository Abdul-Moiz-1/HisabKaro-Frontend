import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import {
  BankIcon,
  DeviceMobileIcon,
  CheckCircleIcon,
} from 'phosphor-react-native';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import {
  bankAccountsApi,
  Banks,
  CreateBankAccountPayload,
} from '../../services/api/bankAccounts';
import {
  addBankAccountSchema,
  AddBankAccountFormData,
  ACCOUNT_TYPE_OPTIONS,
} from './schemas/bankAccountSchemas';
import {
  TextInputField,
  AmountInputField,
  DropdownField,
  TextAreaField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';

// Bank/Wallet grid items with colors
const BANK_GRID_ITEMS = [
  { id: 'HBL', name: 'HBL', color: '#00A859', icon: 'bank' },
  { id: 'Meezan Bank', name: 'Meezan', color: '#008C45', icon: 'bank' },
  { id: 'UBL', name: 'UBL', color: '#E31937', icon: 'bank' },
  { id: 'Bank Alfalah', name: 'Alfalah', color: '#C8102E', icon: 'bank' },
  { id: 'MCB', name: 'MCB', color: '#FFD700', icon: 'bank' },
  { id: 'Allied Bank', name: 'Allied', color: '#0055A5', icon: 'bank' },
];

const WALLET_GRID_ITEMS = [
  { id: 'JazzCash', name: 'JazzCash', color: '#E60000', icon: 'wallet' },
  { id: 'Easypaisa', name: 'Easypaisa', color: '#4CAF50', icon: 'wallet' },
  { id: 'SadaPay', name: 'SadaPay', color: '#FF6B35', icon: 'wallet' },
  { id: 'NayaPay', name: 'NayaPay', color: '#6C63FF', icon: 'wallet' },
];

const DIGITAL_WALLETS = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

const AddBankAccountScreen: React.FC<NavigationProps<'AddBankAccount'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [wallet, setWallet] = useState<Banks[]>([]);
  const [banks, setBanks] = useState<Banks[]>([]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AddBankAccountFormData>({
    resolver: zodResolver(addBankAccountSchema),
    mode: 'onChange',
    defaultValues: {
      accountTitle: '',
      accountNumber: '',
      openingBalance: '0',
    },
  });

  const watchedBankId = watch('bankId');
  const isWallet = banks.some(w => w.id === watchedBankId);

  useEffect(() => {
    fetchBankData();
  }, []);

  // Handle bank/wallet selection from grid
  const handleBankSelect = (bankId: number) => {
    setSelectedBank(bankId);
    setValue('bankId', bankId, { shouldValidate: true });
  };

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const { data: banks } = await bankAccountsApi.getAllBanks();

      console.log(banks);
      const filteredMobileWallet = banks.filter(bank =>
        DIGITAL_WALLETS.includes(bank.name.toLowerCase()),
      );

      const filterdBanks = banks.filter(
        bank => !DIGITAL_WALLETS.includes(bank.name.toLowerCase()),
      );

      setWallet(filteredMobileWallet);
      setBanks(filterdBanks);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load Banks/Wallets',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (data: AddBankAccountFormData) => {
    try {
      setIsSubmitting(true);

      const payload: CreateBankAccountPayload = {
        bankId: data.bankId,
        accountTitle: data.accountTitle.trim(),
        accountNumber: data.accountNumber.trim(),
        openingBalance: data.openingBalance
          ? parseFloat(data.openingBalance)
          : 0,
      };

      const newAccount = await bankAccountsApi.create(payload);
      console.log(newAccount);
      Toast.show({
        type: 'success',
        text1: 'Account Linked',
        text2: `${newAccount.account_title} account has been added successfully`,
      });

      // Navigate to account detail
      navigation.replace('BankAccountDetail', { accountId: newAccount.id });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Render bank/wallet grid item
  const renderGridItem = (item: Banks) => {
    const isSelected = selectedBank === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.gridItem,
          isSelected && styles.gridItemSelected,
          { borderColor: isSelected ? '#00A859' : theme.colors.border },
        ]}
        onPress={() => handleBankSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.gridIconContainer]}>
          <Image
            source={{ uri: item.logoUrl }}
            style={{ width: 50, height: 50 }}
          />{' '}
        </View>

        <Text style={styles.gridItemName}>{item.name}</Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <CheckCircleIcon size={16} color={'#00A859'} weight="fill" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          {/* Bank Selection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏦</Text>
              <Text style={styles.sectionTitle}>Select Bank</Text>
            </View>

            <View style={styles.gridContainer}>
              {banks.map(renderGridItem)}
            </View>
          </View>

          {/* Wallet Selection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📱</Text>
              <Text style={styles.sectionTitle}>Digital Wallets</Text>
            </View>

            <View style={styles.gridContainer}>
              {wallet.map(renderGridItem)}
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📝</Text>
              <Text style={styles.sectionTitle}>Account Details</Text>
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

            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'accountNumber',
                    name: 'accountNumber',
                    label: isWallet ? 'Mobile Number' : 'Account Number / IBAN',
                    type: FieldType.TEXT,
                    placeholder: isWallet
                      ? '03001234567'
                      : 'Enter account number',
                    required: true,
                  }}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.accountNumber?.message}
                />
              )}
            />
          </View>

          {/* Financial Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>Opening Balance</Text>
            </View>

            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'openingBalance',
                    name: 'openingBalance',
                    label: 'Initial Balance',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    hint: 'Current balance in this account',
                  }}
                  value={value?.toString() || '0'}
                  onChange={text => onChange(text)}
                  onBlur={onBlur}
                  error={errors.openingBalance?.message}
                />
              )}
            />
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
                title={isSubmitting ? 'Linking...' : '✓ Link Account'}
                onPress={handleSubmit(handleSaveAccount)}
                variant="primary"
                disabled={!isValid || !selectedBank || isSubmitting}
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
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    gridItem: {
      width: '31%',
      aspectRatio: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      position: 'relative',
    },
    gridItemSelected: {
      backgroundColor: theme.colors.background,
    },
    gridIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    gridItemName: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    selectedBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
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

export default AddBankAccountScreen;
