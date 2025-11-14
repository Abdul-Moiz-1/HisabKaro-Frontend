import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, SearchBar, TabSelector, TransactionItem } from '../../components/common';
import { Transaction } from '../../components/common/TransactionItem';
import { theme } from '../../constants/theme';

const TransactionHistoryScreen: React.FC<NavigationProps<'TransactionHistory'>> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Spending', label: 'Spending' },
    { id: 'Income', label: 'Income' },
  ];

  // Mock transaction data grouped by date
  const transactionsByDate: { title: string; data: Transaction[] }[] = [
    {
      title: '2 July 2023',
      data: [
        {
          id: '1',
          type: 'expense',
          category: 'Taxi',
          merchant: 'Uber',
          amount: 15,
          time: '8:25 pm',
          icon: '🚗',
        },
        {
          id: '2',
          type: 'income',
          category: 'Transfer',
          merchant: 'Kapital Bank',
          amount: 350,
          time: '9:45 pm',
          icon: '💰',
        },
        {
          id: '3',
          type: 'expense',
          category: 'Food',
          merchant: 'Starbucks',
          amount: 17,
          time: '9:50 pm',
          icon: '☕',
        },
        {
          id: '4',
          type: 'expense',
          category: 'Food',
          merchant: 'Starbucks',
          amount: 17,
          time: '9:50 pm',
          icon: '☕',
        },
      ],
    },
    {
      title: '1 July 2023',
      data: [
        {
          id: '5',
          type: 'expense',
          category: 'Shopping',
          merchant: 'Bravo',
          amount: 46,
          time: '8:25 pm',
          icon: '🛍️',
        },
      ],
    },
    {
      title: '14 June 2023',
      data: [
        {
          id: '6',
          type: 'expense',
          category: 'Taxi',
          merchant: 'Uber',
          amount: 12,
          time: '9:45 pm',
          icon: '🚗',
        },
      ],
    },
    {
      title: '6 June 2023',
      data: [
        {
          id: '7',
          type: 'expense',
          category: 'Taxi',
          merchant: 'Uber',
          amount: 15,
          time: '8:25 pm',
          icon: '🚗',
        },
        {
          id: '8',
          type: 'income',
          category: 'Transfer',
          merchant: 'Kapital Bank',
          amount: 350,
          time: '9:45 pm',
          icon: '💰',
        },
        {
          id: '9',
          type: 'expense',
          category: 'Food',
          merchant: 'Starbucks',
          amount: 17,
          time: '9:50 pm',
          icon: '☕',
        },
      ],
    },
  ];

  const filteredTransactions = transactionsByDate.map((section) => ({
    ...section,
    data: section.data.filter((transaction) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Spending') return transaction.type === 'expense';
      if (activeTab === 'Income') return transaction.type === 'income';
      return true;
    }),
  })).filter((section) => section.data.length > 0);

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    return <TransactionItem transaction={item} showDate={false} />;
  }, []);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  }, []);

  console.log('filteredTransactions', filteredTransactions);

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Transaction History"
        onBackPress={() => navigation.goBack()}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {filteredTransactions.length > 0 ? (
        <SectionList
          sections={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  sectionHeaderText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default TransactionHistoryScreen;

