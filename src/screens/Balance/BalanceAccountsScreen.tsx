import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, AccountCard } from '../../components/common';
import { theme } from '../../constants/theme';

const BalanceAccountsScreen: React.FC<NavigationProps<'BalanceAccounts'>> = ({ navigation }) => {
  const accounts = [
    { id: '1', name: 'PASHABANK USD', balance: 425.35, icon: '🏦' },
    { id: '2', name: 'Cash USD', balance: 600, icon: '💵' },
    { id: '3', name: 'LEOBANK USD', balance: 775.79, icon: '🏦' },
    { id: '4', name: 'KAPITALBank USD', balance: 591.33, icon: '🏦' },
    { id: '5', name: 'CENTRALBANK USD', balance: 15.98, icon: '🏦' },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAccountPress = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      navigation.navigate('BankAccountDetails', { accountId, accountName: account.name });
    }
  };

  const handleAddNew = () => {
    // Navigate to add account screen or show modal
    console.log('Add new account');
  };

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Balance"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.accountsGrid}>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountCardWrapper}>
              <AccountCard
                name={account.name}
                balance={account.balance}
                icon={account.icon}
                onPress={() => handleAccountPress(account.id)}
              />
            </View>
          ))}
          <View style={styles.accountCardWrapper}>
            <AccountCard
              name=""
              balance={0}
              isAddNew
              onPress={handleAddNew}
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  balanceSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  balanceLabel: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  balanceAmount: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontSize: 36,
    fontWeight: 'bold',
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
  },
  accountCardWrapper: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
});

export default BalanceAccountsScreen;

