import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { authService, AuthServiceError } from '../../services/authService';
import { clearUser } from '../../store/slices/userSlice';
import { clearBiometricProfile } from '../../utils/biometrics';
import { Theme, useThemedStyles } from '../../theme';

const HomeScreen: React.FC<NavigationProps<'Home'>> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'Daily' | 'Weekly' | 'Monthly'
  >('Monthly');
  const [activeTab, setActiveTab] = useState<string>('home');
  const dispatch = useAppDispatch();
  const { user, refreshToken } = useAppSelector(state => state.user);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const styles = useThemedStyles(createStyles);

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

  const handleLogout = useCallback(async () => {
    setLogoutLoading(true);
    try {
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
      await clearBiometricProfile();
      dispatch(clearUser());
      navigation.replace(ROUTES.LOGIN);
    } catch (error) {
      const apiError = error as AuthServiceError;
      Toast.show({
        type: 'error',
        text1: 'Logout failed',
        text2: apiError.message ?? 'Please try again',
      });
    } finally {
      setLogoutLoading(false);
    }
  }, [dispatch, navigation, refreshToken]);

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>
            Hi {user?.firstName ?? user?.name ?? 'there'}
          </Text>
          <Text style={styles.subGreeting}>Welcome back to HisabKaro</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator color={theme.colors.text.inverse} />
          ) : (
            <Text style={styles.logoutIcon}>⎋</Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Balance */}
        <BalanceCard
          userName="Farida Orojova"
          balance={425.35}
          onAvatarPress={() => navigation.navigate(ROUTES.PROFILE)}
          onNotificationPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          onBalancePress={() => navigation.navigate(ROUTES.BALANCE_ACCOUNTS)}
        />

        {/* Savings Progress */}
        <SavingsProgressCard
          savedAmount={75}
          targetAmount={100}
          message="Well done!"
          subtitle="You saved 25% from last month."
        />

        {/* Currency Cards */}
        <CurrencyCards
          onCardPress={accountId => {
            // Navigate to balance accounts screen
            navigation.navigate(ROUTES.BALANCE_ACCOUNTS);
          }}
          onSeeAll={() => navigation.navigate(ROUTES.BALANCE_ACCOUNTS)}
        />

        {/* Action Buttons */}
        <ActionButtons />

        {/* Transaction History */}
        <TransactionHistory
          onSeeAll={() => navigation.navigate(ROUTES.TRANSACTION_HISTORY)}
        />

        {/* Monthly Budget */}
        <MonthlyBudget
          spent={3000}
          limit={5000}
          onSeeAll={() => navigation.navigate(ROUTES.BUDGET)}
        />

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending Chart */}
        <SpendingChart period={selectedPeriod} />

        {/* Expenses */}
        <ExpensesSection
          onSeeAll={() => navigation.navigate(ROUTES.EXPENSES)}
        />

        {/* Scheduled Payments */}
        <ScheduledPayments
          onSeeAll={() => navigation.navigate(ROUTES.SCHEDULED_PAYMENTS)}
        />

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

const createStyles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  greetingText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  subGreeting: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoutIcon: {
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  periodSelector: {
    flexDirection: 'row' as const,
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
    alignItems: 'center' as const,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
  periodTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: '600' as const,
  },
  addWidgetButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed' as const,
    paddingVertical: theme.spacing.xl,
  },
  addWidgetContent: {
    alignItems: 'center' as const,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  addIconText: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    fontWeight: '300' as const,
  },
  addWidgetText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default HomeScreen;
