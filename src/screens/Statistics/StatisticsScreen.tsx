import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, SearchBar, TabSelector, LineChart, PieChart } from '../../components/common';
import { theme } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { useAppSelector } from '../../store/hooks';

const StatisticsScreen: React.FC<NavigationProps<'Statistics'>> = ({ navigation }) => {
  const { user } = useAppSelector((state) => state.user);
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');
  const [searchQuery, setSearchQuery] = useState('');

  const periodTabs = [
    { id: 'Daily', label: 'Daily' },
    { id: 'Weekly', label: 'Weekly' },
    { id: 'Monthly', label: 'Monthly' },
    { id: 'Yearly', label: 'Yearly' },
  ];

  // Mock data
  const lineChartData = [
    { label: 'Mon', value: 500 },
    { label: 'Tue', value: 800 },
    { label: 'Wed', value: 1200 },
    { label: 'Thur', value: 1500 },
    { label: 'Fri', value: 1800 },
    { label: 'Sat', value: 2000 },
    { label: 'Sun', value: 2400 },
  ];

  const expenseSegments = [
    { id: '1', label: 'Shopping', value: 158, color: '#FF3B30' },
    { id: '2', label: 'Food', value: 125, color: '#FF9500' },
    { id: '3', label: 'Groceries', value: 67, color: theme.colors.primary },
    { id: '4', label: 'Health', value: 28, color: '#5AC8FA' },
    { id: '5', label: 'Travel', value: 685, color: '#AF52DE' },
    { id: '6', label: 'Taxi', value: 32, color: '#007AFF' },
  ];

  const totalExpenses = expenseSegments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title=""
        showBackButton={false}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.iconText}>🌙</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            >
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.headerSection}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName || user?.name || 'User'}
          </Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TabSelector
        tabs={periodTabs}
        activeTab={selectedPeriod}
        onTabChange={setSelectedPeriod}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>23 May 2023</Text>
        </View>

        <LineChart data={lineChartData} height={150} />

        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>+5%</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>-2%</Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>$2408.45</Text>
        </View>

        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsScroll}>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>🏦</Text>
              <Text style={styles.accountName}>PASHABANK USD</Text>
              <Text style={styles.accountBalance}>$425.35</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>🏦</Text>
              <Text style={styles.accountName}>LEOBANK</Text>
              <Text style={styles.accountBalance}>$775.79</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>💵</Text>
              <Text style={styles.accountName}>Cash USD</Text>
              <Text style={styles.accountBalance}>$600</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>🏦</Text>
              <Text style={styles.accountName}>KAPITALBANK USD</Text>
              <Text style={styles.accountBalance}>$591.33</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountIcon}>🏦</Text>
              <Text style={styles.accountName}>CENTRALBANK USD</Text>
              <Text style={styles.accountBalance}>$15.98</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <PieChart segments={expenseSegments} total={totalExpenses} size={200} showLegend />
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  headerSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  dateSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  expenseValue: {
    color: theme.colors.warning,
  },
  balanceSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  balanceLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  accountsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  accountsScroll: {
    flexDirection: 'row',
  },
  accountItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    minWidth: 140,
    ...theme.shadows.sm,
  },
  accountIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  accountName: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  accountBalance: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  expensesSection: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAll: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default StatisticsScreen;

