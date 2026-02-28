// flows/accountTransfer/screens/SourceAccountSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

interface Account {
  id: string;
  type: 'bank' | 'cash' | 'wallet';
  name: string;
  balance: number;
  details?: string;
  icon: string;
  color: string;
}

const mockAccounts: Account[] = [
  {
    id: 'cash',
    type: 'cash',
    name: 'Cash in Hand',
    balance: 125000,
    icon: 'wallet',
    color: '#34C759',
  },
  {
    id: 'bank1',
    type: 'bank',
    name: 'HBL Business Account',
    balance: 250000,
    details: '****1234',
    icon: 'business',
    color: '#007AFF',
  },
  {
    id: 'bank2',
    type: 'bank',
    name: 'Meezan Bank Savings',
    balance: 150000,
    details: '****5678',
    icon: 'business',
    color: '#5856D6',
  },
  {
    id: 'jazzcash',
    type: 'wallet',
    name: 'JazzCash',
    balance: 45000,
    details: '0300-1234567',
    icon: 'phone-portrait',
    color: '#FF3B30',
  },
  {
    id: 'easypaisa',
    type: 'wallet',
    name: 'Easypaisa',
    balance: 32000,
    details: '0321-9876543',
    icon: 'phone-portrait',
    color: '#34C759',
  },
];

const SourceAccountSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();
  const [accounts] = useState<Account[]>(mockAccounts);

  const handleAccountSelect = (account: Account) => {
    navigateToScreen('AmountEntry', { sourceAccount: account });
  };

  const renderAccount = (account: Account) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountCard}
      onPress={() => handleAccountSelect(account)}
    >
      <View
        style={[styles.accountIcon, { backgroundColor: account.color + '20' }]}
      >
        <Icon name={account.icon as any} size={24} color={account.color} />
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{account.name}</Text>
        {account.details && (
          <Text style={styles.accountDetails}>{account.details}</Text>
        )}
        <Text style={styles.accountBalance}>
          PKR {account.balance.toLocaleString()}
        </Text>
      </View>

      <Icon name="chevron-forward" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="swap-horizontal" size={24} color="#007AFF" />
          <Text style={styles.infoText}>
            Transfer money between your accounts
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>Transfer from which account?</Text>

        {/* Cash Section */}
        <Text style={styles.sectionTitle}>Cash</Text>
        {accounts
          .filter(acc => acc.type === 'cash')
          .map(account => renderAccount(account))}

        {/* Bank Accounts Section */}
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        {accounts
          .filter(acc => acc.type === 'bank')
          .map(account => renderAccount(account))}

        {/* Mobile Wallets Section */}
        <Text style={styles.sectionTitle}>Mobile Wallets</Text>
        {accounts
          .filter(acc => acc.type === 'wallet')
          .map(account => renderAccount(account))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  infoCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  accountCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  accountDetails: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  accountBalance: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
});

export default SourceAccountSelectionScreen;
