// screens/transactions/TransactionStatsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TransactionStatsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>(
    'week',
  );

  // Mock data
  const stats = {
    totalIncome: 573000,
    totalExpense: 477800,
    netProfit: 95200,
    incomeChange: 12.5,
    expenseChange: -5.3,
    transactionCount: 47,
  };

  const categoryBreakdown = [
    { name: 'Sales', amount: 450000, percentage: 78, color: '#007AFF' },
    { name: 'Receipts', amount: 123000, percentage: 22, color: '#34C759' },
  ];

  const expenseBreakdown = [
    { name: 'Purchases', amount: 280000, percentage: 59, color: '#FF9500' },
    { name: 'Expenses', amount: 150000, percentage: 31, color: '#FF3B30' },
    { name: 'Payments', amount: 47800, percentage: 10, color: '#FF2D55' },
  ];

  const topCustomers = [
    { name: 'Ahmed Electronics', amount: 145000, transactions: 8 },
    { name: 'Bilal Store', amount: 98000, transactions: 12 },
    { name: 'Hassan Traders', amount: 76000, transactions: 6 },
  ];

  const topSuppliers = [
    { name: 'Al-Rehman Traders', amount: 180000, transactions: 5 },
    { name: 'Metro Cash & Carry', amount: 95000, transactions: 7 },
    { name: 'Bismillah Wholesale', amount: 65000, transactions: 4 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction Analytics</Text>
          <Text style={styles.headerSubtitle}>Overview of your business</Text>
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                timePeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setTimePeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  timePeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Ionicons name="trending-up" size={24} color="#34C759" />
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>
              PKR {stats.totalIncome.toLocaleString()}
            </Text>
            <View style={styles.changeContainer}>
              <Ionicons name="arrow-up" size={16} color="#34C759" />
              <Text style={[styles.changeText, { color: '#34C759' }]}>
                {stats.incomeChange}%
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Ionicons name="trending-down" size={24} color="#FF3B30" />
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={styles.summaryValue}>
              PKR {stats.totalExpense.toLocaleString()}
            </Text>
            <View style={styles.changeContainer}>
              <Ionicons name="arrow-down" size={16} color="#34C759" />
              <Text style={[styles.changeText, { color: '#34C759' }]}>
                {Math.abs(stats.expenseChange)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Net Profit Card */}
        <View style={styles.profitCard}>
          <View style={styles.profitHeader}>
            <Text style={styles.profitLabel}>Net Profit</Text>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#8E8E93"
            />
          </View>
          <Text style={styles.profitValue}>
            PKR {stats.netProfit.toLocaleString()}
          </Text>
          <Text style={styles.profitSubtext}>
            From {stats.transactionCount} transactions this {timePeriod}
          </Text>
        </View>

        {/* Income Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Income Breakdown</Text>

          {categoryBreakdown.map((category, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <View
                  style={[
                    styles.breakdownDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.breakdownName}>{category.name}</Text>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={styles.breakdownAmount}>
                  PKR {category.amount.toLocaleString()}
                </Text>
                <Text style={styles.breakdownPercentage}>
                  {category.percentage}%
                </Text>
              </View>
            </View>
          ))}

          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {categoryBreakdown.map((category, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Expense Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Expense Breakdown</Text>

          {expenseBreakdown.map((category, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <View
                  style={[
                    styles.breakdownDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.breakdownName}>{category.name}</Text>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={styles.breakdownAmount}>
                  PKR {category.amount.toLocaleString()}
                </Text>
                <Text style={styles.breakdownPercentage}>
                  {category.percentage}%
                </Text>
              </View>
            </View>
          ))}

          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {expenseBreakdown.map((category, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Top Customers */}
        <View style={styles.topListCard}>
          <View style={styles.topListHeader}>
            <Text style={styles.topListTitle}>Top Customers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {topCustomers.map((customer, index) => (
            <View key={index} style={styles.topListItem}>
              <View style={styles.topListRank}>
                <Text style={styles.topListRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topListInfo}>
                <Text style={styles.topListName}>{customer.name}</Text>
                <Text style={styles.topListMeta}>
                  {customer.transactions} transactions
                </Text>
              </View>
              <Text style={styles.topListAmount}>
                PKR {customer.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Suppliers */}
        <View style={styles.topListCard}>
          <View style={styles.topListHeader}>
            <Text style={styles.topListTitle}>Top Suppliers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {topSuppliers.map((supplier, index) => (
            <View key={index} style={styles.topListItem}>
              <View style={styles.topListRank}>
                <Text style={styles.topListRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topListInfo}>
                <Text style={styles.topListName}>{supplier.name}</Text>
                <Text style={styles.topListMeta}>
                  {supplier.transactions} transactions
                </Text>
              </View>
              <Text style={styles.topListAmount}>
                PKR {supplier.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  periodSelector: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center' as const,
    borderRadius: theme.borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  summaryCards: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  changeText: {
    ...theme.typography.caption,
    fontWeight: '600' as const,
  },
  profitCard: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  profitHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  profitLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  profitValue: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
    marginBottom: theme.spacing.xs,
  },
  profitSubtext: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  breakdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  breakdownTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  breakdownInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  breakdownName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  breakdownRight: {
    alignItems: 'flex-end' as const,
  },
  breakdownAmount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  breakdownPercentage: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row' as const,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  progressBar: {
    height: '100%' as const,
  },
  topListCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  topListHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  topListTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  viewAllText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  topListItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  topListRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  topListRankText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  topListInfo: {
    flex: 1,
  },
  topListName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  topListMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  topListAmount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
});

export default TransactionStatsScreen;
