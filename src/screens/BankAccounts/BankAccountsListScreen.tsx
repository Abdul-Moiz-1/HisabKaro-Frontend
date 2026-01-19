import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  BankIcon,
  DeviceMobileIcon,
  PlusIcon,
  CaretRightIcon,
  WalletIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import {
  Container,
  HeaderNavigation,
  SearchBar,
  Button,
} from '../../components/common';
import { useTheme } from '../../store/hooks';
import { bankAccountsApi, BankAccount } from '../../services/api/bankAccounts';
import { formatCurrency } from '../../utils';

// Digital wallet names for categorization
const DIGITAL_WALLETS = ['JazzCash', 'Easypaisa', 'SadaPay', 'NayaPay'];

const BankAccountsListScreen: React.FC<NavigationProps<'BankAccountsList'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Separate linked accounts (banks) and digital wallets
  const { linkedAccounts, digitalWallets } = useMemo(() => {
    const filtered = searchQuery
      ? accounts.filter(
          a =>
            a.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.accountTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.accountNumber.includes(searchQuery),
        )
      : accounts;

    return {
      linkedAccounts: filtered.filter(
        a => !DIGITAL_WALLETS.includes(a.bankName),
      ),
      digitalWallets: filtered.filter(a =>
        DIGITAL_WALLETS.includes(a.bankName),
      ),
    };
  }, [accounts, searchQuery]);

  // Fetch accounts
  const fetchAccounts = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setListLoading(true);
      }

      const [accountsResponse, balanceResponse] = await Promise.all([
        bankAccountsApi.getAll({ includeInactive: false, search: searchQuery }),
        bankAccountsApi.getTotalBankBalance(),
      ]);

      console.log(accountsResponse);

      setAccounts(accountsResponse.data);
      setTotalBalance(balanceResponse.total_balance);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch accounts',
      });
    } finally {
      setListLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [searchQuery]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAccounts(true);
  };

  // Navigate to account details
  const handleAccountPress = (account: BankAccount) => {
    navigation.navigate('BankAccountDetail', { accountId: account.id });
  };

  // Navigate to add account
  const handleAddAccount = () => {
    navigation.navigate('AddBankAccount');
  };

  // Delete account
  const handleDeleteAccount = (account: BankAccount) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.bankName} - ${account.accountTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bankAccountsApi.delete(account.id);
              setAccounts(prev => prev.filter(a => a.id !== account.id));
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${account.bankName} account has been removed`,
              });
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

  // Get bank icon color based on bank name
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

  // Render account item
  const renderAccountItem = ({ item }: { item: BankAccount }) => {
    const isWallet = DIGITAL_WALLETS.includes(item.bankName);
    const iconColor = getBankColor(item.bankName);

    return (
      <TouchableOpacity
        style={styles.accountCard}
        onPress={() => handleAccountPress(item)}
        onLongPress={() => handleDeleteAccount(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.accountIcon]}>
          {isWallet ? (
            <DeviceMobileIcon size={24} color={iconColor} weight="fill" />
          ) : (
            <BankIcon size={24} color={iconColor} weight="fill" />
          )}
        </View>

        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{item.bankName}</Text>
          <Text style={styles.accountTitle}>{item.accountTitle}</Text>
          {item.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>

        <View style={styles.accountBalance}>
          <Text style={styles.balanceAmount}>
            {formatCurrency(item.currentBalance)}
          </Text>
          <Text style={styles.balanceLabel}>Balance</Text>
        </View>

        <CaretRightIcon size={16} color={theme.colors.text.disabled} />
      </TouchableOpacity>
    );
  };

  // Render total balance header
  const renderHeader = () => (
    <View style={styles.totalBalanceCard}>
      <View style={styles.totalBalanceIcon}>
        <WalletIcon size={28} color="#FFFFFF" weight="fill" />
      </View>
      <View style={styles.totalBalanceInfo}>
        <Text style={styles.totalBalanceLabel}>KUL BALANCE (TOTAL)</Text>
        <Text style={styles.totalBalanceAmount}>
          {formatCurrency(totalBalance)}
        </Text>
      </View>
    </View>
  );

  // Render section header
  const renderSectionHeader = (
    title: string,
    count: number,
    icon: React.ReactNode,
  ) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  // Render list loading state
  const renderListLoading = () => (
    <View style={styles.listLoadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.listLoadingText}>Loading accounts...</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (listLoading) {
      return renderListLoading();
    }

    return (
      <View style={styles.emptyContainer}>
        <BankIcon size={64} color={theme.colors.text.disabled} weight="light" />
        <Text style={styles.emptyTitle}>No Accounts Found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No accounts match "${searchQuery}"`
            : 'Link your bank account or wallet to get started'}
        </Text>
        {!searchQuery && (
          <Button
            title="Link Account"
            onPress={handleAddAccount}
            variant="primary"
            style={styles.emptyButton}
          />
        )}
      </View>
    );
  };

  // Render main content
  const renderContent = () => {
    if (listLoading) {
      return renderListLoading();
    }

    if (accounts.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        {/* Total Balance */}
        {renderHeader()}

        {/* Linked Accounts Section */}
        {linkedAccounts.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              'Linked Accounts',
              linkedAccounts.length,
              <BankIcon size={20} color={theme.colors.primary} weight="fill" />,
            )}
            {linkedAccounts.map(account => (
              <View key={account.id}>
                {renderAccountItem({ item: account })}
              </View>
            ))}
          </View>
        )}

        {/* Digital Wallets Section */}
        {digitalWallets.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader(
              'Digital Wallets',
              digitalWallets.length,
              <DeviceMobileIcon
                size={20}
                color={theme.colors.success}
                weight="fill"
              />,
            )}
            {digitalWallets.map(account => (
              <View key={account.id}>
                {renderAccountItem({ item: account })}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Bank & Wallets"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAccount}
            activeOpacity={0.7}
          >
            <PlusIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search accounts by name, bank..."
        />
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'content'}
        renderItem={null}
        ListHeaderComponent={renderContent}
        ListEmptyComponent={null}
        contentContainerStyle={[
          styles.listContent,
          accounts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddAccount}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    emptyListContent: {
      flex: 1,
    },
    totalBalanceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      marginBottom: theme.spacing.lg,
    },
    totalBalanceIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    totalBalanceInfo: {
      flex: 1,
    },
    totalBalanceLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    totalBalanceAmount: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    countBadge: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    accountCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    accountIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    accountInfo: {
      flex: 1,
    },
    accountName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    accountTitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    defaultBadge: {
      backgroundColor: `${theme.colors.success}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.success,
    },
    accountBalance: {
      alignItems: 'flex-end',
      marginRight: theme.spacing.sm,
    },
    balanceAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    balanceLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    listLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    listLoadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      minWidth: 160,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: theme.spacing.md,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
  });

export default BankAccountsListScreen;
