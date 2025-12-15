import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import { formatCurrency } from '../../../utils';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const expenseCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Expense',
    amount: 850.00,
    percentage: 15,
    color: theme.colors.primary
  },
  {
    id: '2',
    name: 'Credit',
    amount: 450.00,
    percentage: 8,
    color: theme.colors.error
  },
  {
    id: '3',
    name: 'Bills',
    amount: 1200.00,
    percentage: 2,
    color: '#FF9500'
  },
];

interface ExpensesSectionProps {
  onSeeAll?: () => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ onSeeAll }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        {expenseCategories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            {/* <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Text style={styles.icon}>{category.icon}</Text>
            </View> */}
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
            <Text style={styles.categoryPercentage}>{category.percentage}% ↓</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  categoriesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  // iconContainer: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginBottom: theme.spacing.sm,
  // },
  // icon: {
  //   fontSize: 18,
  // },
  categoryName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  categoryAmount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  categoryPercentage: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontSize: 11,
  },
});
