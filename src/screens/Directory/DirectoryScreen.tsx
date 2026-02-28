import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  UsersIcon,
  HandshakeIcon,
  PackageIcon,
  BankIcon,
  PlusIcon,
  UserPlusIcon,
} from 'phosphor-react-native';

import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { SearchBar } from '../../components/common';
import {
  fetchDashboardSummary,
  fetchDirectoryCounts,
  selectDashboardSummary,
  selectDashboardLoading,
  selectDirectoryCounts,
  selectRecentActivity,
  fetchRecentActivity,
} from '../../store/slices/dashboardSlice';
import { ROUTES } from '../../constants/routes';

const DirectoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const dashboardData = useAppSelector(selectDashboardSummary);
  const directoryCounts = useAppSelector(selectDirectoryCounts);
  const recentActivity = useAppSelector(selectRecentActivity);
  const isLoading = useAppSelector(selectDashboardLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDashboardSummary());
      dispatch(fetchDirectoryCounts());
      dispatch(fetchRecentActivity(5));
    }, [dispatch]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardSummary()),
      dispatch(fetchDirectoryCounts()),
      dispatch(fetchRecentActivity(5)),
    ]);
    setIsRefreshing(false);
  }, [dispatch]);

  const masterDataSections = useMemo(
    () => [
      {
        id: 'customers',
        title: 'Customers',
        subtitle: 'Grahak',
        icon: UsersIcon,
        iconColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}15`,
        count: directoryCounts.customersCount,
        statusLabel: 'Active',
        statusColor: theme.colors.success,
        route: ROUTES.CUSTOMERS_LIST,
        detail: `PKR ${(
          dashboardData?.total_receivables || 0
        ).toLocaleString()} Due`,
      },
      {
        id: 'suppliers',
        title: 'Suppliers',
        subtitle: 'Vendors',
        icon: HandshakeIcon,
        iconColor: '#FF6B35',
        backgroundColor: '#FF6B3515',
        count: directoryCounts.suppliersCount,
        statusLabel: directoryCounts.pendingSuppliersCount
          ? `${directoryCounts.pendingSuppliersCount} Pending`
          : undefined,
        statusColor: '#FF6B35',
        route: ROUTES.SUPPLIERS_LIST,
        detail: `PKR ${(
          dashboardData?.total_payables || 0
        ).toLocaleString()} Payable`,
      },
      {
        id: 'inventory',
        title: 'Inventory',
        subtitle: 'Maal / Products',
        icon: PackageIcon,
        iconColor: '#4169E1',
        backgroundColor: '#4169E115',
        count: directoryCounts.productsCount,
        statusLabel: dashboardData?.low_stock_count
          ? `${dashboardData.low_stock_count} Low`
          : undefined,
        statusColor: theme.colors.error,
        route: ROUTES.INVENTORY_LIST,
        detail: `${directoryCounts.productsCount} SKUs`,
      },
      {
        id: 'banks',
        title: 'Banks',
        subtitle: 'Accounts / Khata',
        icon: BankIcon,
        iconColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
        count: directoryCounts.bankAccountsCount,
        statusLabel: 'Live',
        statusColor: theme.colors.success,
        route: ROUTES.BANK_ACCOUNTS_LIST,
        detail: `${directoryCounts.bankAccountsCount} Linked`,
      },
    ],
    [directoryCounts, dashboardData, theme],
  );

  const handleSectionPress = useCallback(
    (route: string) => {
      // @ts-ignore
      navigation.navigate(route);
    },
    [navigation],
  );

  const renderSectionCard = useCallback(
    (section: (typeof masterDataSections)[0]) => (
      <TouchableOpacity
        key={section.id}
        style={styles.sectionCard}
        onPress={() => handleSectionPress(section.route)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: section.backgroundColor },
          ]}
        >
          <section.icon size={32} color={section.iconColor} weight="fill" />
        </View>

        {section.statusLabel && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${section.statusColor}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: section.statusColor }]}>
              {section.statusLabel}
            </Text>
          </View>
        )}

        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>

          <Text style={styles.sectionCount}>
            {section.count} <Text style={styles.countLabel}>Total</Text>
          </Text>

          {section.detail && (
            <Text style={styles.sectionDetail}>{section.detail}</Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [styles, handleSectionPress],
  );

  const renderRecentActivity = () => {
    if (!recentActivity || recentActivity.length === 0) {
      return null;
    }

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.slice(0, 3).map(activity => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <UserPlusIcon size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading directory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>✨</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Directory</Text>
          <Text style={styles.headerSubtitle}>Master Data</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <UserPlusIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search or say 'Naya customer'..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Main Business Lists Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Main Business Lists</Text>
          <Text style={styles.mainSubtitle}>Asli Karobar / Directories</Text>
        </View>

        {/* Master Data Grid */}
        <View style={styles.grid}>
          {masterDataSections.map(renderSectionCard)}
        </View>

        {/* Recent Activity */}
        {renderRecentActivity()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      color: theme.colors.text.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    headerIconText: {
      fontSize: 24,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.primary,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    searchContainer: {
      marginVertical: theme.spacing.md,
    },
    titleSection: {
      marginBottom: theme.spacing.lg,
    },
    mainTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    mainSubtitle: {
      fontSize: 14,
      color: theme.colors.primary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    sectionCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      position: 'relative',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    statusBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
    },
    sectionContent: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    sectionCount: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    countLabel: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.text.disabled,
    },
    sectionDetail: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    recentSection: {
      marginTop: theme.spacing.lg,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    recentTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    seeAll: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.xs,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    activitySubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: theme.spacing.md,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
  });

export default DirectoryScreen;
