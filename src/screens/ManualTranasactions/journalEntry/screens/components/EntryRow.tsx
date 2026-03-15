import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { TrashIcon, InfoIcon } from 'phosphor-react-native';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { useTheme, useAppSelector, useAppDispatch } from '../../../../../store/hooks';
import { JournalEntryFormValues } from '../../schema';
import AccountSelectorCard from './AccountSelectorCard';
import { Account } from '../../../../../services/api/accounting';
import { BankAccount } from '../../../../../services/api/bankAccounts';

type LineItem = JournalEntryFormValues['lineItems'][number];

interface EntryRowProps {
  index: number;
  control: Control<JournalEntryFormValues>;
  error?: FieldErrors<LineItem>;
  accounts: Account[];
  accountsLoading?: boolean;
  onDelete: (index: number) => void;
  canDelete?: boolean;
}

const EntryRow: React.FC<EntryRowProps> = ({
  index,
  control,
  error,
  accounts,
  accountsLoading = false,
  onDelete,
  canDelete = true,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);

  // Watch debit and credit values for this row
  const debitValue = useWatch({
    control,
    name: `lineItems.${index}.debit`,
  });

  const creditValue = useWatch({
    control,
    name: `lineItems.${index}.credit`,
  });

  // Calculate new balance after transaction (for bank accounts)
  const newBalance = useMemo(() => {
    if (!selectedBankAccount) return null;

    const currentBalance = selectedBankAccount.currentBalance || 0;
    const debit = Number(debitValue) || 0;
    const credit = Number(creditValue) || 0;

    // For asset accounts: debit increases, credit decreases
    return currentBalance + debit - credit;
  }, [selectedBankAccount, debitValue, creditValue]);

  const handleAccountSelect = useCallback((account: Account, onChange: (value: number) => void) => {
    setSelectedAccount(account);
    onChange(account.id);
  }, []);

  const handleBankAccountSelect = useCallback((bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
  }, []);

  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with Entry Number and Delete Button */}
      <View style={styles.header}>
        <Text style={styles.entryLabel}>ENTRY #{index + 1}</Text>
        {canDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <TrashIcon size={18} color={theme.colors.error} weight="fill" />
          </TouchableOpacity>
        )}
      </View>

      {/* Account Selector */}
      <Controller
        control={control}
        name={`lineItems.${index}.accountId`}
        render={({ field: { onChange, value } }) => (
          <AccountSelectorCard
            selectedAccount={selectedAccount}
            selectedBankAccount={selectedBankAccount}
            onSelectAccount={(account) => handleAccountSelect(account, onChange)}
            onSelectBankAccount={handleBankAccountSelect}
            accounts={accounts}
            isLoading={accountsLoading}
            error={error?.accountId?.message}
          />
        )}
      />

      {/* Debit and Credit Inputs */}
      <View style={styles.amountContainer}>
        {/* Debit Input */}
        <View style={styles.amountField}>
          <Text style={styles.amountLabel}>Debit (Rs.)</Text>
          <Controller
            control={control}
            name={`lineItems.${index}.debit`}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[
                  styles.amountInput,
                  error?.debit && styles.amountInputError,
                ]}
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const numValue = text ? parseFloat(text.replace(/[^0-9.]/g, '')) : 0;
                  onChange(isNaN(numValue) ? 0 : numValue);
                }}
                onBlur={onBlur}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>

        {/* Credit Input */}
        <View style={styles.amountField}>
          <Text style={styles.amountLabel}>Credit (Rs.)</Text>
          <Controller
            control={control}
            name={`lineItems.${index}.credit`}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[
                  styles.amountInput,
                  error?.credit && styles.amountInputError,
                ]}
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const numValue = text ? parseFloat(text.replace(/[^0-9.]/g, '')) : 0;
                  onChange(isNaN(numValue) ? 0 : numValue);
                }}
                onBlur={onBlur}
                placeholder="0"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>
      </View>

      {/* New Balance Indicator (for bank accounts) */}
      {selectedBankAccount && newBalance !== null && (
        <View style={styles.balanceIndicator}>
          <InfoIcon size={14} color={theme.colors.primary} />
          <Text style={styles.balanceText}>
            New Balance: <Text style={styles.balanceAmount}>{formatCurrency(newBalance)}</Text>
            <Text style={styles.balanceLabel}> (after transaction)</Text>
          </Text>
        </View>
      )}

      {/* Error Messages */}
      {(error?.debit?.message || error?.credit?.message) && (
        <Text style={styles.errorText}>
          {error?.debit?.message || error?.credit?.message}
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    entryLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    deleteButton: {
      padding: theme.spacing.xs,
    },
    amountContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    amountField: {
      flex: 1,
    },
    amountLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    amountInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    amountInputError: {
      borderColor: theme.colors.error,
    },
    balanceIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    balanceText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    balanceAmount: {
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    balanceLabel: {
      color: theme.colors.text.secondary,
      fontWeight: '400',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  });

export default EntryRow;
