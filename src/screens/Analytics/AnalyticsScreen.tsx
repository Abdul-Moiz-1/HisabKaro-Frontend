import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, TabSelector } from '../../components/common';
import { useTheme } from '../../store/hooks';
import { formatCurrency } from '../../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 32;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2;

interface ExpenseData {
  category: string;
  amount: number;
  color: string;

}

interface BudgetData {
  category: string;
  spent: number;
  limit: number;
  color: string;
}

// Mock data for different periods
const expenseDataByPeriod: Record<string, ExpenseData[]> = {
  Daily: [
    { category: 'Expense', amount: 850, color: '#FF9500'},
    { category: 'Credit', amount: 450, color: '#007AFF' },
    { category: 'Shopping', amount: 1200, color: '#FF3B30' },
    { category: 'Bills', amount: 350, color: '#5856D6'},
    { category: 'Miscellaneous', amount: 600, color: '#AF52DE'},
  ],
  Weekly: [
    { category: 'Expense', amount: 5950, color: '#FF9500' },
    { category: 'Credit', amount: 3150, color: '#007AFF' },
    { category: 'Shopping', amount: 8400, color: '#FF3B30' },
    { category: 'Bills', amount: 2450, color: '#5856D6' },
    { category: 'Miscellaneous', amount: 4200, color: '#AF52DE' },
  ],
  Monthly: [
    { category: 'Expense', amount: 25500, color: '#FF9500' },
    { category: 'Credit', amount: 13500, color: '#007AFF'  },
    { category: 'Shopping', amount: 36000, color: '#FF3B30' },
    { category: 'Bills', amount: 10500, color: '#5856D6' },
    { category: 'Miscellaneous', amount: 18000, color: '#AF52DE' },
  ],
};

const budgetDataByPeriod: Record<string, BudgetData[]> = {
  Daily: [
    { category: 'Expense', spent: 850, limit: 1500, color: '#FF9500' },
    { category: 'Credit', spent: 450, limit: 800, color: '#007AFF' },
    { category: 'Shopping', spent: 1200, limit: 1000, color: '#FF3B30' },
    { category: 'Miscellaneous', spent: 600, limit: 1000, color: '#AF52DE' },
  ],
  Weekly: [
    { category: 'Expense', spent: 5950, limit: 10500, color: '#FF9500' },
    { category: 'Credit', spent: 3150, limit: 5600, color: '#007AFF' },
    { category: 'Shopping', spent: 8400, limit: 7000, color: '#FF3B30' },
    { category: 'Miscellaneous', spent: 4200, limit: 7000, color: '#AF52DE' },
  ],
  Monthly: [
    { category: 'Expense', spent: 25500, limit: 45000, color: '#FF9500' },
    { category: 'Credit', spent: 13500, limit: 24000, color: '#007AFF' },
    { category: 'Shopping', spent: 36000, limit: 30000, color: '#FF3B30' },
    { category: 'Miscellaneous', spent: 18000, limit: 30000, color: '#AF52DE' },
  ],
};

const AnalyticsScreen: React.FC<NavigationProps<'Analytics'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');

  const periodTabs = [
    { id: 'Daily', label: 'Daily' },
    { id: 'Weekly', label: 'Weekly' },
    { id: 'Monthly', label: 'Monthly' },
  ];

  const expenseData = expenseDataByPeriod[selectedPeriod];
  const budgetData = budgetDataByPeriod[selectedPeriod];

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const maxExpense = Math.max(...expenseData.map(item => item.amount));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          paddingBottom: theme.spacing.xxl,
        },
        section: {
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.h3,
          color: theme.colors.text.primary,
        },
        totalContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          ...theme.shadows.md,
        },
        totalLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs,
        },
        totalAmount: {
          ...theme.typography.h1,
          color: theme.colors.primary,
          fontSize: 32,
          fontWeight: 'bold',
        },
        totalSubtext: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.xs,
        },
        chartContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          ...theme.shadows.md,
          overflow: 'hidden',
        },
        chartTitle: {
          ...theme.typography.body,
          color: theme.colors.text.primary,
          fontWeight: '600',
          marginBottom: theme.spacing.md,
        },
        barChartContainer: {
          width: '100%',
        },
        barRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        barLabel: {
          width: 80,
          flexDirection: 'row',
          alignItems: 'center',
        },
        barIcon: {
          fontSize: 16,
          marginRight: theme.spacing.xs,
        },
        barLabelText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 12,
        },
        barWrapper: {
          flex: 1,
          height: 24,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          overflow: 'hidden',
          marginHorizontal: theme.spacing.sm,
        },
        bar: {
          height: '100%',
          borderRadius: theme.borderRadius.md,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
        },
        barAmount: {
          ...theme.typography.caption,
          color: theme.colors.text.primary,
          fontWeight: '600',
          fontSize: 11,
          textAlign: 'right',
          minWidth: 70,
        },
        budgetCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          ...theme.shadows.sm,
        },
        budgetHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        },
        budgetCategory: {
          ...theme.typography.body,
          color: theme.colors.text.primary,
          fontWeight: '500',
        },
        budgetPercentage: {
          ...theme.typography.caption,
          fontWeight: '600',
        },
        budgetProgressBg: {
          height: 8,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.sm,
          overflow: 'hidden',
          marginBottom: theme.spacing.xs,
        },
        budgetProgressBar: {
          height: '100%',
          borderRadius: theme.borderRadius.sm,
        },
        budgetAmounts: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        budgetSpent: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 12,
        },
        budgetLimit: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 12,
        },
        legendContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: theme.spacing.md,
          gap: theme.spacing.sm,
        },
        legendItem: {
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: theme.spacing.md,
        },
        legendDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          marginRight: theme.spacing.xs,
        },
        legendText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 12,
        },
        pieChartContainer: {
          alignItems: 'center',
          marginVertical: theme.spacing.md,
        },
        pieChart: {
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        },
        pieCenter: {
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        },
        pieCenterText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontSize: 11,
        },
        pieCenterAmount: {
          ...theme.typography.body,
          color: theme.colors.text.primary,
          fontWeight: 'bold',
          fontSize: 14,
        },
        summaryRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        summaryCard: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          ...theme.shadows.sm,
        },
        summaryIcon: {
          fontSize: 24,
          marginBottom: theme.spacing.xs,
        },
        summaryLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs,
        },
        summaryValue: {
          ...theme.typography.body,
          color: theme.colors.text.primary,
          fontWeight: '600',
        },
        summaryChange: {
          ...theme.typography.caption,
          marginTop: theme.spacing.xs,
          fontSize: 12,
        },
      }),
    [theme],
  );

  const renderBarChart = () => {
    return (
      <View style={styles.barChartContainer}>
        {expenseData.map((item, index) => {
          const barWidth = (item.amount / maxExpense) * 100;
          return (
            <View key={index} style={styles.barRow}>
              <View style={styles.barLabel}>
                <Text style={styles.barLabelText} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min(barWidth, 100)}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderBudgetProgress = () => {
    return budgetData.map((budget, index) => {
      const percentage = (budget.spent / budget.limit) * 100;
      const isOverBudget = percentage > 100;
      const displayPercentage = Math.min(percentage, 100);
      const percentageColor = isOverBudget
        ? theme.colors.error
        : percentage > 80
        ? theme.colors.warning
        : theme.colors.success;

      return (
        <View key={index} style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetCategory}>{budget.category}</Text>
            <Text style={[styles.budgetPercentage, { color: percentageColor }]}>
              {Math.round(percentage)}%
              {isOverBudget && ' ⚠️'}
            </Text>
          </View>
          <View style={styles.budgetProgressBg}>
            <View
              style={[
                styles.budgetProgressBar,
                {
                  width: `${displayPercentage}%`,
                  backgroundColor: isOverBudget
                    ? theme.colors.error
                    : budget.color,
                },
              ]}
            />
          </View>
          <View style={styles.budgetAmounts}>
            <Text style={styles.budgetSpent}>
              Spent: {formatCurrency(budget.spent)}
            </Text>
            <Text style={styles.budgetLimit}>
              Limit: {formatCurrency(budget.limit)}
            </Text>
          </View>
        </View>
      );
    });
  };

  const renderExpenseDistribution = () => {
    return (
      <View>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {/* Simplified pie representation with colored segments */}
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                flexDirection: 'row',
                borderRadius: 90,
                overflow: 'hidden',
              }}
            >
              {expenseData.map((item, index) => {
                const percentage = (item.amount / totalExpenses) * 100;
                return (
                  <View
                    key={index}
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: item.color,
                    }}
                  />
                );
              })}
            </View>
            <View style={styles.pieCenter}>
              <Text style={styles.pieCenterText}>Total</Text>
              <Text style={styles.pieCenterAmount}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.legendContainer}>
          {expenseData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.category} ({Math.round((item.amount / totalExpenses) * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Analytics"
        onBackPress={() => navigation.goBack()}
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
        {/* Total Expenses Summary */}
        <View style={styles.section}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>
              Total {selectedPeriod} Expenses
            </Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalExpenses)}</Text>
            <Text style={styles.totalSubtext}>
              {selectedPeriod === 'Daily'
                ? 'Today'
                : selectedPeriod === 'Weekly'
                ? 'This Week'
                : 'This Month'}
            </Text>
          </View>
        </View>

        {/* Quick Summary Cards */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📈</Text>
              <Text style={styles.summaryLabel}>Highest Expense</Text>
              <Text style={styles.summaryValue}>
                {expenseData.reduce((max, item) =>
                  item.amount > max.amount ? item : max,
                ).category}
              </Text>
              <Text style={[styles.summaryChange, { color: theme.colors.error }]}>
                {formatCurrency(maxExpense)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📊</Text>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>{expenseData.length} Active</Text>
              <Text
                style={[styles.summaryChange, { color: theme.colors.success }]}
              >
                Tracked
              </Text>
            </View>
          </View>
        </View>

        {/* Expenses Bar Chart */}
        <View style={styles.section}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>📊 Expenses by Category</Text>
            {renderBarChart()}
          </View>
        </View>

        {/* Expense Distribution */}
        <View style={styles.section}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>🥧 Expense Distribution</Text>
            {renderExpenseDistribution()}
          </View>
        </View>

        {/* Budget Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Budget Progress</Text>
          </View>
          {renderBudgetProgress()}
        </View>
      </ScrollView>
    </Container>
  );
};

export default AnalyticsScreen;
