import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  BellIcon,
  WalletIcon,
  BankIcon,
  ShoppingCartIcon,
  ArrowDownIcon,
  PackageIcon,
  UserPlusIcon,
  SunIcon,
  MoonIcon,
  ArrowsClockwiseIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import { NavigationProps } from '../../types';
import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import { Container, FloatingActionButton } from '../../components/common';
import Toast from 'react-native-toast-message';
import { authApi } from '../../services/api/auth';
import { logout } from '../../store/slices/userSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import {
  initializeDashboard,
  refreshDashboard,
  selectDashboardSummary,
  selectRecentActivity,
  selectDashboardLoading,
  selectDashboardRefreshing,
  selectDashboardError,
  selectLastUpdated,
  clearError,
} from '../../store/slices/dashboardSlice';
import { ActivityItem } from '../../components/common/ActivityItem';
import { GradientCard } from '../../components/common/GradientCard';
import { QuickActionButton } from '../../components/common/QuickActionButton';
import { RecentActivity } from '../../services/api/reports';

const HomeScreen: React.FC<NavigationProps<'Home'>> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // User state
  const { user, refreshToken } = useAppSelector(state => state.user);

  // Dashboard state from Redux
  const summary = useAppSelector(selectDashboardSummary);
  const recentActivity = useAppSelector(selectRecentActivity);
  const isLoading = useAppSelector(selectDashboardLoading);
  const isRefreshing = useAppSelector(selectDashboardRefreshing);
  const error = useAppSelector(selectDashboardError);
  const lastUpdated = useAppSelector(selectLastUpdated);

  // Initialize dashboard on mount
  useEffect(() => {
    if (!summary) {
      dispatch(initializeDashboard());
    }
  }, [dispatch, summary]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    dispatch(refreshDashboard());
  }, [dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
      dispatch(logout());
      navigation.replace(ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(logout());
      navigation.replace(ROUTES.LOGIN);
    }
  }, [dispatch, navigation]);

  // Navigation handlers
  const handleNewSale = () => navigation.navigate(ROUTES.ADD_TRANSACTION_SALES);
  const handlePaymentIn = () =>
    navigation.navigate(ROUTES.ADD_TRANSACTION_RECEIPT);
  const handlePurchase = () =>
    navigation.navigate(ROUTES.ADD_TRANSACTION_PURCHASE);
  const handleNewCustomer = () => navigation.navigate(ROUTES.TRANSCATIONS);

  // Format last updated time
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }, [lastUpdated]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        welcomeText: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
        },
        businessName: {
          ...theme.typography.h2,
          color: theme.colors.text.primary,
          marginTop: 2,
        },
        headerActions: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          alignItems: 'center',
        },
        iconButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.sm,
        },
        notificationDot: {
          position: 'absolute',
          top: 10,
          right: 10,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.error,
        },
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          paddingBottom: theme.spacing.xl,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: theme.spacing.xxl,
        },
        loadingText: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.md,
        },
        errorContainer: {
          margin: theme.spacing.md,
          padding: theme.spacing.lg,
          backgroundColor: `${theme.colors.error}15`,
          borderRadius: theme.borderRadius.lg,
          flexDirection: 'row',
          alignItems: 'center',
        },
        errorText: {
          ...theme.typography.body,
          color: theme.colors.error,
          flex: 1,
          marginLeft: theme.spacing.sm,
        },
        retryButton: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.error,
          borderRadius: theme.borderRadius.md,
        },
        retryButtonText: {
          ...theme.typography.button,
          color: '#FFFFFF',
        },
        lastUpdatedContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.xs,
          gap: theme.spacing.xs,
        },
        lastUpdatedText: {
          fontSize: 11,
          color: theme.colors.text.disabled,
        },
        balanceCardsContainer: {
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        balanceCardsRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          flexGrow: 0,
        },
        balanceCard: {
          flex: 1,
          minWidth: 300,
        },
        summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        summaryItem: {
          alignItems: 'center',
          flex: 1,
        },
        summaryValue: {
          fontSize: 16,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
        },
        summaryLabel: {
          fontSize: 11,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.md,
          marginTop: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: 12,
        },
        viewAllText: {
          fontSize: 13,
          color: theme.colors.primary,
          fontWeight: '600',
        },
        quickActionsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.md,
        },
        quickActionItem: {
          width: '47%' as const,
        },
        activityList: {
          paddingHorizontal: theme.spacing.md,
        },
        emptyActivityText: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          paddingVertical: theme.spacing.xl,
        },
      }),
    [theme],
  );

  // Map activity type to component type
  const getActivityType = (
    type: RecentActivity['type'],
  ): 'income' | 'expense' | 'restock' => {
    switch (type) {
      case 'income':
      case 'payment_in':
        return 'income';
      case 'expense':
      case 'payment_out':
        return 'expense';
      case 'restock':
        return 'restock';
      default:
        return 'expense';
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 100000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  // Loading state
  if (isLoading && !summary) {
    return (
      <Container safeArea edges={['top']} style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.businessName}>
              {user?.firstName || user?.name || 'Loading...'}
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.businessName}>
            {user?.firstName || user?.name || 'Ahmed Electronics'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            activeOpacity={0.7}
          >
            <BellIcon
              size={22}
              color={theme.colors.text.primary}
              weight="regular"
            />
            {!!summary?.pending_invoices_count &&
              summary.pending_invoices_count > 0 && (
                <View style={styles.notificationDot} />
              )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => dispatch(toggleTheme())}
            activeOpacity={0.7}
          >
            {theme.mode === 'dark' ? (
              <MoonIcon
                size={22}
                color={theme.colors.text.primary}
                weight="fill"
              />
            ) : (
              <SunIcon
                size={22}
                color={theme.colors.text.primary}
                weight="fill"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Last Updated Indicator */}
        {!!lastUpdated && (
          <View style={styles.lastUpdatedContainer}>
            <ArrowsClockwiseIcon size={12} color={theme.colors.text.disabled} />
            <Text style={styles.lastUpdatedText}>
              Updated {formattedLastUpdated}
            </Text>
          </View>
        )}

        {/* Balance Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.balanceCardsRow}
          contentContainerStyle={styles.balanceCardsContainer}
        >
          <GradientCard
            title="Cash in Hand"
            value={summary?.cash_in_hand || 0}
            valuePrefix="PKR"
            icon={<WalletIcon size={22} color="#FFFFFF" weight="fill" />}
            badge="LIVE"
            gradientColors={['#00C853', '#00897B']}
            onPress={() => navigation.navigate(ROUTES.BALANCE_ACCOUNTS)}
            style={styles.balanceCard}
          />
          <GradientCard
            title="Bank Balance"
            value={summary?.bank_balance || 0}
            valuePrefix="PKR"
            icon={
              <BankIcon
                size={22}
                color={theme.colors.text.primary}
                weight="fill"
              />
            }
            gradientColors={['#E8F5E9', '#C8E6C9']}
            darkText
            onPress={() => navigation.navigate(ROUTES.BALANCE_ACCOUNTS)}
            style={styles.balanceCard}
          />
        </ScrollView>

        {/* Quick Stats Summary */}
        {summary && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text
                style={[styles.summaryValue, { color: theme.colors.success }]}
              >
                ₨ {formatCurrency(summary.today_sales)}
              </Text>
              <Text style={styles.summaryLabel}>Today Sales</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={[styles.summaryValue, { color: theme.colors.error }]}
              >
                ₨ {formatCurrency(summary.today_purchases)}
              </Text>
              <Text style={styles.summaryLabel}>Today Purchases</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                ₨ {formatCurrency(summary.total_receivables)}
              </Text>
              <Text style={styles.summaryLabel}>Receivables</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={[styles.summaryValue, { color: theme.colors.warning }]}
              >
                ₨ {formatCurrency(summary.total_payables)}
              </Text>
              <Text style={styles.summaryLabel}>Payables</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="New Sale"
            subtitle="Naya Sale"
            icon={
              <ShoppingCartIcon
                size={22}
                color={theme.colors.primary}
                weight="bold"
              />
            }
            onPress={handleNewSale}
            style={styles.quickActionItem}
          />
          <QuickActionButton
            title="Payment In"
            subtitle="Wasooli"
            icon={
              <ArrowDownIcon
                size={22}
                color={theme.colors.info}
                weight="bold"
              />
            }
            onPress={handlePaymentIn}
            iconBackgroundColor={`${theme.colors.info}20`}
            iconColor={theme.colors.info}
            style={styles.quickActionItem}
          />
        </View>

        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Purchase"
            subtitle="Khareedari"
            icon={
              <PackageIcon
                size={22}
                color={theme.colors.warning}
                weight="bold"
              />
            }
            onPress={handlePurchase}
            iconBackgroundColor={`${theme.colors.warning}20`}
            iconColor={theme.colors.warning}
            style={styles.quickActionItem}
          />
          <QuickActionButton
            title="Customer"
            subtitle="Gahak"
            icon={
              <UserPlusIcon
                size={22}
                color={theme.colors.error}
                weight="bold"
              />
            }
            onPress={handleNewCustomer}
            iconBackgroundColor={`${theme.colors.error}20`}
            iconColor={theme.colors.error}
            style={styles.quickActionItem}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.TRANSACTION_LIST)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {recentActivity.length > 0 ? (
            recentActivity.map(item => (
              <ActivityItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                amount={item.amount}
                type={getActivityType(item.type)}
                onPress={() => navigation.navigate(ROUTES.TRANSACTION_LIST)}
              />
            ))
          ) : (
            <Text style={styles.emptyActivityText}>
              No recent activity. Start by creating a sale or purchase!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => navigation.navigate(ROUTES.TRANSCATIONS)}
      />
    </Container>
  );
};

export default HomeScreen;
