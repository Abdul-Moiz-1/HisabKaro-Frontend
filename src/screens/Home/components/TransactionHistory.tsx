import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../../store/hooks';
import { formatCurrency } from '../../../utils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  subtitle: string;
  amount: number;
  time: string;
  icon: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    title: 'Taxi',
    subtitle: 'Uber',
    amount: -15,
    time: '8:25 p.m.',
    icon: '🚗',
  },
  {
    id: '2',
    type: 'income',
    title: 'Transfer',
    subtitle: 'Capital Bank',
    amount: 350,
    time: '9:05 p.m.',
    icon: '🏦',
  },
  {
    id: '3',
    type: 'expense',
    title: 'Food',
    subtitle: 'Starbucks',
    amount: -17,
    time: '8:00 p.m.',
    icon: '☕',
  },
];

type TabType = 'All' | 'Spending' | 'Income';

interface TransactionHistoryProps {
  onSeeAll?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onSeeAll }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  console.log('activeTab', activeTab);

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Spending') return transaction.type === 'expense';
    if (activeTab === 'Income') return transaction.type === 'income';
    return true;
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    seeAll: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    tab: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.md,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.body,
      color: theme.colors.text.primary, // Black in light mode, white in dark mode
      opacity: 0.6, // Make inactive tabs slightly transparent but still visible
    },
    activeTabText: {
      color: theme.colors.text.primary, // Pure black in light mode, pure white in dark mode
      fontWeight: '600',
      opacity: 1, // Full opacity for active tab
    },
    transactionList: {
      maxHeight: 200,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    iconText: {
      fontSize: 18,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionTitle: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    transactionSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    transactionRight: {
      alignItems: 'flex-end',
    },
    transactionAmount: {
      ...theme.typography.body,
      fontWeight: '600',
    },
    transactionTime: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
  }), [theme]);

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? theme.colors.success : theme.colors.text.primary }
          ]}>
            {item.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
          </Text>
          <Text style={styles.transactionTime}>{item.time}</Text>
        </View>
      </View>
    );
  }, [styles, theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['All', 'Spending', 'Income'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};
