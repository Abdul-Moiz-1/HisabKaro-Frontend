import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  WalletIcon,
  MoneyIcon,
  BankIcon,
  XIcon,
  CreditCardIcon,
  FileTextIcon,
  ChartLineUpIcon,
  BuildingsIcon,
} from 'phosphor-react-native';
import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../../store/hooks';
import { Account } from '../../../../../services/api/accounting';
import { BankAccount } from '../../../../../services/api/bankAccounts';
import BankAccountBottomSheet from './BankAccountBottomSheet';

interface AccountSelectorCardProps {
  selectedAccount?: Account | null;
  selectedBankAccount?: BankAccount | null;
  onSelectAccount: (account: Account) => void;
  onSelectBankAccount?: (bankAccount: BankAccount) => void;
  accounts: Account[];
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
}

// Account type icon mapping
const getAccountIcon = (
  account: Account,
  theme: ReturnType<typeof useTheme>,
) => {
  const iconProps = {
    size: 20,
    color: theme.colors.text.secondary,
    weight: 'fill' as const,
  };

  switch (account.accountType) {
    case 'Cash':
      return <MoneyIcon {...iconProps} />;
    case 'Bank':
      return <BuildingsIcon {...iconProps} />;
    case 'Receivable':
      return <FileTextIcon {...iconProps} />;
    case 'Payable':
      return <CreditCardIcon {...iconProps} />;
    case 'Revenue':
      return <ChartLineUpIcon {...iconProps} color={theme.colors.success} />;
    case 'Expense':
      return <ChartLineUpIcon {...iconProps} color={theme.colors.error} />;
    default:
      return <WalletIcon {...iconProps} />;
  }
};

const getRootTypeLabel = (rootType: string) => {
  switch (rootType) {
    case 'Asset':
      return 'Current Asset';
    case 'Liability':
      return 'Current Liability';
    case 'Equity':
      return 'Equity';
    case 'Income':
      return 'Revenue Account';
    case 'Expense':
      return 'Expense Account';
    default:
      return rootType;
  }
};

const AccountSelectorCard: React.FC<AccountSelectorCardProps> = ({
  selectedAccount,
  selectedBankAccount,
  onSelectAccount,
  onSelectBankAccount,
  accounts,
  isLoading = false,
  error,
  placeholder = 'Select Account / Khata chunein',
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten accounts for search
  const flattenedAccounts = useMemo(() => {
    const flatten = (accs: Account[], result: Account[] = []): Account[] => {
      for (const acc of accs) {
        if (!acc.isGroup) {
          result.push(acc);
        }
        if (acc.children) {
          flatten(acc.children, result);
        }
      }
      return result;
    };
    return flatten(accounts);
  }, [accounts]);

  // Filter accounts based on search
  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return flattenedAccounts;
    const query = searchQuery.toLowerCase();
    return flattenedAccounts.filter(
      acc =>
        acc.accountName.toLowerCase().includes(query) ||
        acc.accountCode.toLowerCase().includes(query) ||
        acc.accountType?.toLowerCase().includes(query),
    );
  }, [flattenedAccounts, searchQuery]);

  const handleAccountSelect = useCallback(
    (account: Account) => {
      onSelectAccount(account);
      setShowAccountModal(false);
      setSearchQuery('');
      // If it's a bank account type, show bank selection
      // if (account.accountType === 'Bank' && onSelectBankAccount) {
      //   setShowAccountModal(false);
      //   setShowBankSheet(true);
      // } else {
      //   onSelectAccount(account);
      //   setShowAccountModal(false);
      //   setSearchQuery('');
      // }
    },
    [onSelectAccount, onSelectBankAccount],
  );

  const handleBankSelect = useCallback(
    (bankAccount: BankAccount) => {
      // Create a combined account object
      const bankAsAccount: Account = {
        id: bankAccount.id,
        accountCode: bankAccount.accountNumber || '',
        accountName: `${bankAccount.bankName} (${
          bankAccount.accountNumber?.slice(-4) || ''
        })`,
        rootType: 'Asset',
        accountType: 'Bank',
        isGroup: false,
        isActive: true,
        currentBalance: bankAccount.currentBalance,
      };

      onSelectAccount(bankAsAccount);
      if (onSelectBankAccount) {
        onSelectBankAccount(bankAccount);
      }
      setShowBankSheet(false);
    },
    [onSelectAccount, onSelectBankAccount],
  );

  const renderAccountItem = ({ item }: { item: Account }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => handleAccountSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.accountItemIcon}>{getAccountIcon(item, theme)}</View>
      <View style={styles.accountItemInfo}>
        <Text style={styles.accountItemName}>{item.accountName}</Text>
        <Text style={styles.accountItemType}>
          {getRootTypeLabel(item.rootType)}
        </Text>
      </View>
      {item.currentBalance !== undefined && (
        <Text style={styles.accountItemBalance}>
          Rs. {item.currentBalance.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Display value
  const displayName = selectedBankAccount
    ? `${
        selectedBankAccount.bankName
      } (...${selectedBankAccount.accountNumber?.slice(-4)})`
    : selectedAccount?.accountName;

  const displayType = selectedBankAccount
    ? `${selectedBankAccount.account_type} Account - PKR`
    : selectedAccount
    ? getRootTypeLabel(selectedAccount.rootType)
    : null;

  const hasSelection = selectedAccount || selectedBankAccount;

  return (
    <>
      <TouchableOpacity
        style={[styles.container, error && styles.containerError]}
        onPress={() => setShowAccountModal(true)}
        activeOpacity={0.7}
      >
        {hasSelection ? (
          <View style={styles.selectedContent}>
            <View style={styles.selectedIcon}>
              {selectedBankAccount ? (
                <BuildingsIcon
                  size={20}
                  color={theme.colors.text.primary}
                  weight="fill"
                />
              ) : selectedAccount ? (
                getAccountIcon(selectedAccount, theme)
              ) : null}
            </View>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{displayName}</Text>
              <Text style={styles.selectedType}>{displayType}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContent}>
            <WalletIcon size={20} color={theme.colors.text.secondary} />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
        <View style={styles.searchIconContainer}>
          <MagnifyingGlassIcon size={18} color={theme.colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAccountModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAccountModal(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <XIcon size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <MagnifyingGlassIcon
                size={20}
                color={theme.colors.text.secondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search accounts..."
                placeholderTextColor={theme.colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Account List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredAccounts}
                renderItem={renderAccountItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No accounts found</Text>
                  </View>
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bank Account Selection Bottom Sheet */}
      {/* <BankAccountBottomSheet
        visible={showBankSheet}
        onClose={() => setShowBankSheet(false)}
        onSelect={handleBankSelect}
        onLinkNew={() => {
          setShowBankSheet(false);
          // Navigate to add bank account screen
        }}
      /> */}
    </>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    containerError: {
      borderColor: theme.colors.error,
    },
    selectedContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    selectedInfo: {
      flex: 1,
    },
    selectedName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    selectedType: {
      fontSize: 12,
      color: theme.colors.primary,
      marginTop: 2,
    },
    placeholderContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    placeholderText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    searchIconContainer: {
      padding: theme.spacing.xs,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      paddingBottom: theme.spacing.xl,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    loadingContainer: {
      padding: theme.spacing.xxl,
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    accountItemIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    accountItemInfo: {
      flex: 1,
    },
    accountItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    accountItemType: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    accountItemBalance: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default AccountSelectorCard;
