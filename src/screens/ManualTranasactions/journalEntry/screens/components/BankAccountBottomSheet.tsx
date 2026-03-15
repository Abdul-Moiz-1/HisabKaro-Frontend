import React, { useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  XIcon,
  BankIcon,
  WalletIcon,
  PlusCircleIcon,
  BuildingsIcon,
} from 'phosphor-react-native';
import { useTheme, useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { BankAccount } from '../../../../../services/api/bankAccounts';
import { fetchBankAccounts } from '../../../../../store/slices/bankAccountsSlice';

interface BankAccountBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (account: BankAccount) => void;
  onLinkNew?: () => void;
}

// Bank logo colors mapping
const BANK_COLORS: Record<string, string> = {
  'HBL': '#00A859',
  'Meezan': '#008C45',
  'Meezan Bank': '#008C45',
  'UBL': '#E31937',
  'Alfalah': '#C8102E',
  'MCB': '#FFD700',
  'Allied': '#0055A5',
  'Allied Bank': '#0055A5',
  'JazzCash': '#E60000',
  'Easypaisa': '#4CAF50',
  'SadaPay': '#FF6B35',
  'NayaPay': '#6C63FF',
};

const BankAccountBottomSheet: React.FC<BankAccountBottomSheetProps> = ({
  visible,
  onClose,
  onSelect,
  onLinkNew,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Redux selectors
  const accounts = useAppSelector(state => state.bankAccounts.accounts);
  const isLoading = useAppSelector(state => state.bankAccounts.isLoading);

  // Fetch bank accounts when modal opens
  useEffect(() => {
    if (visible && accounts.length === 0) {
      dispatch(fetchBankAccounts({}));
    }
  }, [visible, accounts.length, dispatch]);

  const getBankColor = useCallback((bankName: string) => {
    // Check if bank name contains any known bank
    for (const [key, color] of Object.entries(BANK_COLORS)) {
      if (bankName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return theme.colors.primary;
  }, [theme.colors.primary]);

  const getBankIcon = useCallback((account: BankAccount) => {
    const bankName = account.bankName?.toLowerCase() || '';
    const isWallet = bankName.includes('jazzcash') ||
                     bankName.includes('easypaisa') ||
                     bankName.includes('sadapay') ||
                     bankName.includes('nayapay');

    const color = getBankColor(account.bankName || '');

    if (isWallet) {
      return <WalletIcon size={24} color={color} weight="fill" />;
    }
    return <BuildingsIcon size={24} color={color} weight="fill" />;
  }, [getBankColor]);

  const formatAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    const last4 = accountNumber.slice(-4);
    return `•••• ${last4}`;
  };

  const formatBalance = (balance: number) => {
    return `Rs. ${balance.toLocaleString()}`;
  };

  const renderBankAccount = ({ item }: { item: BankAccount }) => {
    const bankColor = getBankColor(item.bankName || '');

    return (
      <TouchableOpacity
        style={styles.accountCard}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.bankIconContainer, { backgroundColor: `${bankColor}15` }]}>
          {getBankIcon(item)}
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.bankName}>{item.bankName}</Text>
          <Text style={styles.accountType}>
            {item.accountTitle} {formatAccountNumber(item.accountNumber)}
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>BALANCE</Text>
          <Text style={styles.balanceValue}>{formatBalance(item.currentBalance)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Bank Account</Text>
              <Text style={styles.subtitle}>Konsa bank account istemal karein?</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Account List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={accounts}
              renderItem={renderBankAccount}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <BankIcon size={48} color={theme.colors.text.secondary} />
                  <Text style={styles.emptyText}>No bank accounts found</Text>
                </View>
              }
            />
          )}

          {/* Link New Account Button */}
          {onLinkNew && (
            <TouchableOpacity
              style={styles.linkNewButton}
              onPress={onLinkNew}
              activeOpacity={0.7}
            >
              <PlusCircleIcon size={20} color={theme.colors.primary} />
              <Text style={styles.linkNewText}>Link New Account</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
      paddingBottom: theme.spacing.xl,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.primary,
      marginTop: 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    loadingContainer: {
      padding: theme.spacing.xxl,
      alignItems: 'center',
    },
    listContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    accountCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    bankIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    bankName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    accountType: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    balanceContainer: {
      alignItems: 'flex-end',
    },
    balanceLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    balanceValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: 2,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    linkNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    linkNewText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });

export default BankAccountBottomSheet;
