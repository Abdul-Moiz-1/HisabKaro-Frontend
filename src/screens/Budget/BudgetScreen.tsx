import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, TabSelector, BudgetCard } from '../../components/common';
import { Budget } from '../../components/common/BudgetCard';
import { theme } from '../../constants/theme';

const BudgetScreen: React.FC<NavigationProps<'Budget'>> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('Active');

  const tabs = [
    { id: 'Active', label: 'Active' },
    { id: 'Closed', label: 'Closed' },
  ];

  // Mock budgets data - expanded from HomeScreen MonthlyBudget
  const activeBudgets: Budget[] = [
    {
      id: '1',
      name: 'Monthly Budget',
      spent: 3050,
      limit: 5000,
      period: 'Monthly',
    },
    {
      id: '2',
      name: 'Shopping Budget',
      spent: 1024,
      limit: 1000,
      period: 'Monthly',
    },
  ];

  const closedBudgets: Budget[] = [
    // Add closed budgets here
  ];

  const budgets = activeTab === 'Active' ? activeBudgets : closedBudgets;

  const handleAddNew = () => {
    // Navigate to add budget screen or show modal
    console.log('Add new budget');
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Budget"
        onBackPress={() => navigation.goBack()}
      />

      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              showSeeAll={false}
              onPress={() => {
                // Navigate to budget details
                console.log('Budget details', budget.id);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} budgets</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <View style={styles.addIconContainer}>
            <View style={styles.addIconHorizontal} />
            <View style={styles.addIconVertical} />
          </View>
          <Text style={styles.addText}>Add new budget</Text>
        </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  addButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addIconVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
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

export default BudgetScreen;

