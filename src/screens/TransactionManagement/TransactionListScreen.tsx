// screens/transactions/TransactionListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

interface Transaction {
  id: string;
  type: 'receipt' | 'sale' | 'purchase' | 'expense' | 'transfer' | 'payment';
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'partial';
  party?: string; // Customer/Supplier name
  description: string;
  paymentMethod?: string;
  category?: string;
  reference?: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'receipt',
    date: '2025-12-08T10:30:00',
    amount: 45000,
    status: 'completed',
    party: 'Ahmed Electronics',
    description: 'Payment received',
    paymentMethod: 'Bank Transfer',
    reference: 'REC-123456',
  },
  {
    id: 'TXN-002',
    type: 'sale',
    date: '2025-12-08T09:15:00',
    amount: 28000,
    status: 'partial',
    party: 'Bilal Store',
    description: 'Samsung Galaxy A54 - 2 units',
    paymentMethod: 'Cash',
    reference: 'INV-123457',
  },
  {
    id: 'TXN-003',
    type: 'expense',
    date: '2025-12-07T14:20:00',
    amount: 7800,
    status: 'completed',
    description: 'Electricity Bill',
    category: 'Utilities',
    paymentMethod: 'Bank Transfer',
    reference: 'EXP-123458',
  },
  {
    id: 'TXN-004',
    type: 'purchase',
    date: '2025-12-07T11:00:00',
    amount: 150000,
    status: 'pending',
    party: 'Al-Rehman Traders',
    description: 'Stock purchase - 50 units',
    paymentMethod: 'Credit',
    reference: 'BILL-123459',
  },
  {
    id: 'TXN-005',
    type: 'transfer',
    date: '2025-12-06T16:45:00',
    amount: 50000,
    status: 'completed',
    description: 'Cash to HBL Business Account',
    reference: 'TRF-123460',
  },
  {
    id: 'TXN-006',
    type: 'payment',
    date: '2025-12-06T13:30:00',
    amount: 120000,
    status: 'completed',
    party: 'Metro Cash & Carry',
    description: 'Supplier payment',
    paymentMethod: 'Bank Transfer',
    reference: 'PAY-123461',
  },
];

const TransactionListScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();

  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [filterType, setFilterType] = useState<string>('all');

  const handleTransactionPress = (transaction: Transaction) => {
    // @ts-ignore
    navigation.navigate('TransactionDetail', { transaction });
  };

  const handleFilterPress = () => {
    // @ts-ignore
    navigation.navigate('TransactionFilter');
  };

  const handleSearchPress = () => {
    // @ts-ignore
    navigation.navigate('TransactionSearch');
  };

  const handleStatsPress = () => {
    // @ts-ignore
    navigation.navigate('TransactionStats');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return { name: 'arrow-down-circle', color: '#34C759' };
      case 'sale':
        return { name: 'cart', color: '#007AFF' };
      case 'purchase':
        return { name: 'basket', color: '#FF9500' };
      case 'expense':
        return { name: 'receipt', color: '#FF3B30' };
      case 'transfer':
        return { name: 'swap-horizontal', color: '#5856D6' };
      case 'payment':
        return { name: 'cash', color: '#FF2D55' };
      default:
        return { name: 'document', color: '#8E8E93' };
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'Receipt';
      case 'sale':
        return 'Sale';
      case 'purchase':
        return 'Purchase';
      case 'expense':
        return 'Expense';
      case 'transfer':
        return 'Transfer';
      case 'payment':
        return 'Payment';
      default:
        return 'Transaction';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: '#34C759' };
      case 'pending':
        return { label: 'Pending', color: '#FF9500' };
      case 'partial':
        return { label: 'Partial', color: '#007AFF' };
      default:
        return { label: 'Unknown', color: '#8E8E93' };
    }
  };

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(txn);
    });

    return grouped;
  };

  const renderTransactionItem = (transaction: Transaction) => {
    const icon = getTransactionIcon(transaction.type);
    const statusBadge = getStatusBadge(transaction.status);

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(transaction)}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}
        >
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>

        <View style={styles.transactionInfo}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>
              {getTransactionTypeLabel(transaction.type)}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color:
                    transaction.type === 'receipt' ||
                    transaction.type === 'sale'
                      ? '#34C759'
                      : '#FF3B30',
                },
              ]}
            >
              {transaction.type === 'receipt' || transaction.type === 'sale'
                ? '+'
                : '-'}
              PKR {transaction.amount.toLocaleString()}
            </Text>
          </View>

          {transaction.party && (
            <Text style={styles.transactionParty}>{transaction.party}</Text>
          )}

          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>

          <View style={styles.transactionFooter}>
            <Text style={styles.transactionTime}>
              {new Date(transaction.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusBadge.color + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSearchPress}
          >
            <Ionicons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="funnel" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryContainer}
        contentContainerStyle={styles.summaryContent}
      >
        <TouchableOpacity style={styles.summaryCard} onPress={handleStatsPress}>
          <Text style={styles.summaryLabel}>Total In</Text>
          <Text style={[styles.summaryValue, { color: '#34C759' }]}>
            PKR 173,000
          </Text>
          <Text style={styles.summaryChange}>+12% vs last week</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard} onPress={handleStatsPress}>
          <Text style={styles.summaryLabel}>Total Out</Text>
          <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
            PKR 277,800
          </Text>
          <Text style={styles.summaryChange}>-5% vs last week</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryCard} onPress={handleStatsPress}>
          <Text style={styles.summaryLabel}>Net Flow</Text>
          <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
            PKR -104,800
          </Text>
          <Text style={styles.summaryChange}>This week</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          'all',
          'receipt',
          'sale',
          'purchase',
          'expense',
          'transfer',
          'payment',
        ].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              filterType === type && styles.filterTabActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === type && styles.filterTabTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList}>
        {Object.entries(groupedTransactions).map(([date, txns]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {txns.map(txn => renderTransactionItem(txn))}
          </View>
        ))}

        {/* Empty State */}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Your transactions will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  summaryContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexGrow: 0,
  },
  summaryContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  summaryCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: 140,
    ...theme.shadows.sm,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  summaryChange: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  filterTabs: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexGrow: 0,
  },
  filterTabsContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  dateHeader: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  transactionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.xs,
  },
  transactionType: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  transactionAmount: {
    ...theme.typography.body,
    fontWeight: '700' as const,
  },
  transactionParty: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  transactionDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  transactionFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  transactionTime: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});

export default TransactionListScreen;
