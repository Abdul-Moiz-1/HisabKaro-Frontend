import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SectionList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BankIcon,
  DeviceMobileIcon,
  ArrowsLeftRightIcon,
  FileTextIcon,
  ScalesIcon,
  PencilSimpleIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CaretLeftIcon,
  StarIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import {
  bankAccountsApi,
  BankAccount,
  BankAccountTransaction,
} from '../../services/api/bankAccounts';
import { formatCurrency } from '../../utils';

// Digital wallet names for categorization
const DIGITAL_WALLETS = ['JazzCash', 'Easypaisa', 'SadaPay', 'NayaPay'];

interface BankAccountDetailScreenProps
  extends NavigationProps<'BankAccountDetail'> {
  route: {
    params: {
      accountId: string;
    };
  };
}

const BankAccountDetailScreen: React.FC<BankAccountDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { accountId } = route.params;

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankAccountTransaction[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch account details and transactions
  const fetchAccountData = useCallback(
    async (isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [accountData, transactionsData] = await Promise.all([
          bankAccountsApi.getById(accountId),
          bankAccountsApi.getTransactions(accountId),
        ]);

        console.log(accountData);

        setAccount(accountData.data);
        setTransactions(transactionsData);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load account details',
        });
        navigation.goBack();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId, navigation],
  );

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAccountData(true);
  };

  // Navigate to edit screen
  const handleEdit = () => {
    navigation.navigate('EditBankAccount', { accountId });
  };

  // Handle delete
  const handleDelete = () => {
    if (!account) return;

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.bank_name} - ${account.account_title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bankAccountsApi.delete(accountId);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${account.bank_name} account has been removed`,
              });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete account',
              });
            }
          },
        },
      ],
    );
  };

  // Handle set as default
  const handleSetDefault = async () => {
    if (!account) return;

    try {
      await bankAccountsApi.setDefault(accountId);
      setAccount({ ...account, is_default: true });
      Toast.show({
        type: 'success',
        text1: 'Default Account',
        text2: `${account.bank_name} is now your default account`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to set default account',
      });
    }
  };

  // Quick action handlers
  const handleTransfer = () => {
    // Navigate to transfer flow
    Toast.show({
      type: 'info',
      text1: 'Transfer',
      text2: 'Transfer feature coming soon',
    });
  };

  const handleStatement = () => {
    // Navigate to statement view
    Toast.show({
      type: 'info',
      text1: 'Statement',
      text2: 'Statement feature coming soon',
    });
  };

  const handleReconcile = () => {
    // Navigate to reconciliation
    Toast.show({
      type: 'info',
      text1: 'Reconcile',
      text2: 'Reconciliation feature coming soon',
    });
  };

  // Get bank color
  const getBankColor = (bankName: string): string => {
    const colors: Record<string, string> = {
      HBL: '#00A859',
      'Meezan Bank': '#008C45',
      UBL: '#E31937',
      'Allied Bank': '#0055A5',
      MCB: '#FFD700',
      'Bank Alfalah': '#C8102E',
      JazzCash: '#E60000',
      Easypaisa: '#4CAF50',
      SadaPay: '#FF6B35',
      NayaPay: '#6C63FF',
    };
    return colors[bankName] || theme.colors.primary;
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const grouped: { [key: string]: BankAccountTransaction[] } = {};

    transactions.forEach(txn => {
      const date = new Date(txn.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(txn);
    });

    return Object.entries(grouped).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [transactions]);

  // Render transaction item
  const renderTransactionItem = ({
    item,
  }: {
    item: BankAccountTransaction;
  }) => {
    const isCredit = ['deposit', 'transfer_in', 'interest'].includes(item.type);
    const typeLabels: Record<string, string> = {
      deposit: 'Cash Deposit',
      withdrawal: 'Cash Withdrawal',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
      fee: 'Bank Fee',
      interest: 'Interest',
    };

    return (
      <View style={styles.transactionItem}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: isCredit
                ? `${theme.colors.success}15`
                : `${theme.colors.error}15`,
            },
          ]}
        >
          {isCredit ? (
            <ArrowDownIcon
              size={18}
              color={theme.colors.success}
              weight="bold"
            />
          ) : (
            <ArrowUpIcon size={18} color={theme.colors.error} weight="bold" />
          )}
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {typeLabels[item.type] || item.type}
          </Text>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          {item.reference && (
            <Text style={styles.transactionReference}>
              Ref: {item.reference}
            </Text>
          )}
        </View>

        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: isCredit ? theme.colors.success : theme.colors.error },
            ]}
          >
            {isCredit ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.balanceAfter}>
            Bal: {formatCurrency(item.balance_after)}
          </Text>
        </View>
      </View>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!account) {
    return null;
  }

  const isWallet = DIGITAL_WALLETS.includes(account.bank_name);
  const bankColor = getBankColor(account.bank_name);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CaretLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={handleEdit}>
            <PencilSimpleIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleDelete}>
            <TrashIcon size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={groupedTransactions}
        keyExtractor={item => item.id}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Account Card */}
            <View style={[styles.accountCard, { backgroundColor: bankColor }]}>
              <View style={styles.accountCardHeader}>
                <View style={styles.accountIconContainer}>
                  <Image
                    source={{ uri: account?.bank?.logoUrl }}
                    style={{ width: 50, height: 50 }}
                  />{' '}
                </View>
                {account.is_default && (
                  <View style={styles.defaultBadge}>
                    <StarIcon size={12} color="#FFD700" weight="fill" />
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>

              <View style={styles.accountCardContent}>
                <Text style={styles.accountBankName}>{account.bank?.name}</Text>
                <Text style={styles.accountTitle}>{account.accountTitle}</Text>
                <Text style={styles.accountNumber}>
                  {isWallet
                    ? account.accountNumber
                    : `•••• •••• •••• ${account.accountNumber.slice(-4)}`}
                </Text>
              </View>

              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(account.currentBalance)}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={handleTransfer}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${theme.colors.primary}15` },
                    ]}
                  >
                    <ArrowsLeftRightIcon
                      size={24}
                      color={theme.colors.primary}
                      weight="fill"
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>Transfer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={handleStatement}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${theme.colors.info}15` },
                    ]}
                  >
                    <FileTextIcon
                      size={24}
                      color={theme.colors.info}
                      weight="fill"
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>Statement</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={handleReconcile}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${theme.colors.success}15` },
                    ]}
                  >
                    <ScalesIcon
                      size={24}
                      color={theme.colors.success}
                      weight="fill"
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>Reconcile</Text>
                </TouchableOpacity>

                {!account.is_default && (
                  <TouchableOpacity
                    style={styles.quickActionItem}
                    onPress={handleSetDefault}
                  >
                    <View
                      style={[
                        styles.quickActionIcon,
                        { backgroundColor: `${theme.colors.warning}15` },
                      ]}
                    >
                      <StarIcon
                        size={24}
                        color={theme.colors.warning}
                        weight="fill"
                      />
                    </View>
                    <Text style={styles.quickActionLabel}>Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Account Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Account Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Type</Text>
                  <Text style={styles.infoValue}>
                    {account.accountType.charAt(0).toUpperCase() +
                      account.accountType.slice(1)}
                  </Text>
                </View>
                {account?.branch_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Branch</Text>
                    <Text style={styles.infoValue}>{account?.branchName}</Text>
                  </View>
                )}
                {account?.iban && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>IBAN</Text>
                    <Text style={styles.infoValue}>{account.iban}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created At</Text>
                  <Text style={styles.infoValue}>
                    {new Date(account.createdAt).toDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Transactions Header */}
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={handleStatement}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyTransactionsText}>
              No transactions found
            </Text>
          </View>
        }
      />
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    headerAction: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingBottom: theme.spacing.xxl,
    },
    accountCard: {
      margin: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    accountCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    accountIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    defaultBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      gap: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    accountCardContent: {
      marginBottom: theme.spacing.lg,
    },
    accountBankName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    accountTitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: theme.spacing.sm,
    },
    accountNumber: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.9)',
      letterSpacing: 1,
    },
    balanceSection: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
      paddingTop: theme.spacing.md,
    },
    balanceLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    quickActionsContainer: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    quickActionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    quickActionItem: {
      alignItems: 'center',
    },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    quickActionLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    infoSection: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    transactionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    transactionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    seeAllText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    sectionHeader: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    sectionHeaderText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.xs,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    transactionDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    transactionReference: {
      fontSize: 10,
      color: theme.colors.text.disabled,
      marginTop: 2,
    },
    transactionAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontSize: 14,
      fontWeight: '600',
    },
    balanceAfter: {
      fontSize: 10,
      color: theme.colors.text.disabled,
      marginTop: 2,
    },
    emptyTransactions: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },
    emptyTransactionsText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default BankAccountDetailScreen;
