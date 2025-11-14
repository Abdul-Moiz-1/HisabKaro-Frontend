import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SectionList, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, TransactionItem } from '../../components/common';
import { Transaction } from '../../components/common/TransactionItem';
import { theme } from '../../constants/theme';

const BankAccountDetailsScreen: React.FC<NavigationProps<'BankAccountDetails'>> = ({ navigation, route }) => {
  const { accountId, accountName } = route.params || {};

  // Mock account data
  const accountBalance = 425.35;
  const accountIcon = '🏦';

  // Mock transactions grouped by date
  const transactionsByDate: { date: string; data: Transaction[] }[] = [
    {
      date: '2 July 2023',
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
      ],
    },
    {
      date: '1 July 2023',
      data: [
        {
          id: '4',
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
      date: '14 June 2023',
      data: [
        {
          id: '5',
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
      date: '6 June 2023',
      data: [
        {
          id: '6',
          type: 'expense',
          category: 'Taxi',
          merchant: 'Uber',
          amount: 15,
          time: '8:25 pm',
          icon: '🚗',
        },
        {
          id: '7',
          type: 'income',
          category: 'Transfer',
          merchant: 'Kapital Bank',
          amount: 350,
          time: '9:45 pm',
          icon: '💰',
        },
        {
          id: '8',
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

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    return <TransactionItem transaction={item} showDate={false} />;
  }, []);

  const renderSectionHeader = useCallback(({ section }: { section: { date: string } }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.date}</Text>
      </View>
    );
  }, []);

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Balance"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.accountHeader}>
        <View style={styles.accountInfo}>
          <View style={styles.accountIconContainer}>
            <Text style={styles.accountIcon}>{accountIcon}</Text>
          </View>
          <View style={styles.accountDetails}>
            <Text style={styles.accountBalance}>${accountBalance.toFixed(2)}</Text>
            <Text style={styles.accountName}>{accountName || 'Account'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={transactionsByDate}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  accountIcon: {
    fontSize: 24,
  },
  accountDetails: {
    flex: 1,
  },
  accountBalance: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  accountName: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  editButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 18,
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
});

export default BankAccountDetailsScreen;

