import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, SearchBar, TabSelector, PieChart, ExpenseCategoryItem } from '../../components/common';
import { ExpenseCategory } from '../../components/common/ExpenseCategoryItem';
import { theme } from '../../constants/theme';

const ExpensesScreen: React.FC<NavigationProps<'Expenses'>> = ({ navigation, route }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');
  const [searchQuery, setSearchQuery] = useState('');

  const periodTabs = [
    { id: 'Daily', label: 'Daily' },
    { id: 'Weekly', label: 'Weekly' },
    { id: 'Monthly', label: 'Monthly' },
    { id: 'Yearly', label: 'Yearly' },
  ];

  // Mock expense categories data - expanded from HomeScreen
  const expenseCategories: ExpenseCategory[] = [
    {
      id: '1',
      name: 'Groceries',
      amount: 67.0,
      percentage: 15,
      percentageChange: 15,
      color: theme.colors.primary,
      icon: '🛒',
    },
    {
      id: '2',
      name: 'Shopping',
      amount: 158.0,
      percentage: 8,
      percentageChange: -8,
      color: '#FF3B30',
      icon: '🛍️',
    },
    {
      id: '3',
      name: 'Food',
      amount: 125.0,
      percentage: 2,
      percentageChange: -2,
      color: '#FF9500',
      icon: '🍕',
    },
    {
      id: '4',
      name: 'Health',
      amount: 28.0,
      percentage: 1,
      percentageChange: -1,
      color: '#5AC8FA',
      icon: '🏥',
    },
    {
      id: '5',
      name: 'Travel',
      amount: 685.0,
      percentage: 12,
      percentageChange: 12,
      color: '#AF52DE',
      icon: '✈️',
    },
    {
      id: '6',
      name: 'Taxi',
      amount: 32.0,
      percentage: 4,
      percentageChange: 4,
      color: '#007AFF',
      icon: '🚗',
    },
  ];

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const pieSegments = expenseCategories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Expenses"
        onBackPress={() => navigation.goBack()}
      />

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
        {expenseCategories.length > 0 && (
          <View style={styles.chartSection}>
            <PieChart segments={pieSegments} total={totalExpenses} size={220} showLegend />
          </View>
        )}

        <View style={styles.categoriesSection}>
          {expenseCategories.length > 0 ? (
            expenseCategories.map((item) => (
              <ExpenseCategoryItem
                key={item.id}
                category={item}
                onPress={() => {
                  // Navigate to category details
                  console.log('Category details', item.id);
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No expenses found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  chartSection: {
    paddingVertical: theme.spacing.lg,
  },
  categoriesSection: {
    paddingHorizontal: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default ExpensesScreen;

