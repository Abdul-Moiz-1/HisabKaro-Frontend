import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProps } from '../../types';
import { theme } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { Container } from '../../components/common';
import { BottomTabBar } from '../../components/navigation/BottomTabBar';
import { BalanceCard } from './components/BalanceCard';
import { SavingsProgressCard } from './components/SavingsProgressCard';
import { CurrencyCards } from './components/CurrencyCards';
import { ActionButtons } from './components/ActionButtons';
import { TransactionHistory } from './components/TransactionHistory';
import { MonthlyBudget } from './components/MonthlyBudget';
import { SpendingChart } from './components/SpendingChart';
import { ExpensesSection } from './components/ExpensesSection';
import { ScheduledPayments } from './components/ScheduledPayments';

const HomeScreen: React.FC<NavigationProps<'Home'>> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [activeTab, setActiveTab] = useState<string>('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to respective screens
    switch (tabId) {
      case 'home':
        // Already on home screen
        break;
      case 'analytics':
        navigation.navigate(ROUTES.ANALYTICS);
        break;
      case 'add':
        navigation.navigate(ROUTES.ADD_TRANSACTION);
        break;
      case 'ai':
        navigation.navigate(ROUTES.AI_ASSISTANT);
        break;
      case 'menu':
        navigation.navigate(ROUTES.MENU);
        break;
      default:
        break;
    }
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Balance */}
        <BalanceCard 
          userName="Farida Orojova"
          balance={425.35}
        />

        {/* Savings Progress */}
        <SavingsProgressCard 
          savedAmount={75}
          targetAmount={100}
          message="Well done!"
          subtitle="You saved 25% from last month."
        />

        {/* Currency Cards */}
        <CurrencyCards />

        {/* Action Buttons */}
        <ActionButtons />

        {/* Transaction History */}
        <TransactionHistory />

        {/* Monthly Budget */}
        <MonthlyBudget 
          spent={3000}
          limit={5000}
        />

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending Chart */}
        <SpendingChart period={selectedPeriod} />

        {/* Expenses */}
        <ExpensesSection />

        {/* Scheduled Payments */}
        <ScheduledPayments />

        {/* Add Widget Button */}
        <TouchableOpacity style={styles.addWidgetButton}>
          <View style={styles.addWidgetContent}>
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
            <Text style={styles.addWidgetText}>Add widget</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  periodTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  addWidgetButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    paddingVertical: theme.spacing.xl,
  },
  addWidgetContent: {
    alignItems: 'center',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  addIconText: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    fontWeight: '300',
  },
  addWidgetText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default HomeScreen;
