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
  UserPlusIcon,
  Receipt,
  ShoppingCart,
  CurrencyCircleDollar,
} from 'phosphor-react-native';

import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { SearchBar } from '../../components/common';
import {
  fetchDashboardSummary,
  fetchDirectoryCounts,
  selectDashboardSummary,
  selectDashboardLoading,
  selectDirectoryCounts,
} from '../../store/slices/dashboardSlice';
import { ROUTES } from '../../constants/routes';

const DirectoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const dashboardData = useAppSelector(selectDashboardSummary);
  const directoryCounts = useAppSelector(selectDirectoryCounts);
  const isLoading = useAppSelector(selectDashboardLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDashboardSummary());
      dispatch(fetchDirectoryCounts());
    }, [dispatch]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardSummary()),
      dispatch(fetchDirectoryCounts()),
    ]);
    setIsRefreshing(false);
  }, [dispatch]);

  const transactionTiles = useMemo(
    () => [
      {
        id: 'sales',
        title: 'Sales Invoices',
        subtitle: 'Bikri Bills',
        icon: Receipt,
        iconColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}15`,
        route: ROUTES.SALES_INVOICE_LIST,
        statusLabel: 'New Sale',
        statusColor: theme.colors.success,
        value: dashboardData?.monthly_sales
          ? `${Math.round(dashboardData.monthly_sales).toLocaleString()}`
          : '0',
        valueLabel: 'Monthly Total',
        watermarkOpacity: 0.06,
      },
      {
        id: 'purchase',
        title: 'Purchase Bills',
        subtitle: 'Kharidari Bills',
        icon: ShoppingCart,
        iconColor: '#FF6B35',
        backgroundColor: '#FF6B3515',
        route: ROUTES.PURCHASE_INVOICE_LIST,
        statusLabel: dashboardData?.overdue_invoices_count
          ? `${dashboardData.overdue_invoices_count} Overdue`
          : undefined,
        statusColor: '#E65100',
        value: `PKR ${((dashboardData?.total_payables || 0) / 1000000).toFixed(1)}M`,
        valueLabel: 'Pending Payments',
        watermarkOpacity: 0.06,
      },
      {
        id: 'payments',
        title: 'Payments',
        subtitle: 'Wusoliyaan',
        icon: CurrencyCircleDollar,
        iconColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
        route: ROUTES.PAYMENTS_LIST,
        statusLabel: undefined,
        statusColor: undefined,
        value: `PKR ${((dashboardData?.total_receivables || 0) / 1000000).toFixed(1)}M`,
        valueLabel: 'Collections',
        watermarkOpacity: 0.06,
      },
    ],
    [dashboardData, theme],
  );

  const directorySections = useMemo(
    () => [
      {
        id: 'customers',
        title: 'Customers',
        subtitle: 'Grahak',
        icon: UsersIcon,
        iconColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}15`,
        count: directoryCounts.customersCount,
        route: ROUTES.CUSTOMERS_LIST,
      },
      {
        id: 'suppliers',
        title: 'Suppliers',
        subtitle: 'Vendors',
        icon: HandshakeIcon,
        iconColor: '#FF6B35',
        backgroundColor: '#FF6B3515',
        count: directoryCounts.suppliersCount,
        route: ROUTES.SUPPLIERS_LIST,
      },
      {
        id: 'inventory',
        title: 'Inventory',
        subtitle: 'Maal / Products',
        icon: PackageIcon,
        iconColor: '#4169E1',
        backgroundColor: '#4169E115',
        count: directoryCounts.productsCount,
        route: ROUTES.INVENTORY_LIST,
      },
      {
        id: 'banks',
        title: 'Banks',
        subtitle: 'Accounts / Khata',
        icon: BankIcon,
        iconColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
        count: directoryCounts.bankAccountsCount,
        route: ROUTES.BANK_ACCOUNTS_LIST,
      },
    ],
    [directoryCounts, theme],
  );

  const handlePress = useCallback(
    (route: string) => {
      // @ts-ignore
      navigation.navigate(route);
    },
    [navigation],
  );

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
          <Text style={styles.headerTitle}>Master Directory</Text>
          <Text style={styles.headerSubtitle}>BUSINESS DATA HUB</Text>
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
        }>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search or say 'Bikri bill dikhao'..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Text style={styles.sectionSubtitle}>Bikri aur Kharidari / Bills</Text>
        </View>

        {transactionTiles.map(tile => (
          <TouchableOpacity
            key={tile.id}
            style={styles.transactionCard}
            onPress={() => handlePress(tile.route)}
            activeOpacity={0.7}>
            <View style={styles.transactionCardInner}>
              <View style={styles.transactionCardTop}>
                <View
                  style={[
                    styles.tileIconContainer,
                    { backgroundColor: tile.backgroundColor },
                  ]}>
                  <tile.icon size={28} color={tile.iconColor} weight="fill" />
                </View>
                {tile.statusLabel && (
                  <View
                    style={[
                      styles.tileBadge,
                      { backgroundColor: `${tile.statusColor}15` },
                    ]}>
                    <Text
                      style={[styles.tileBadgeText, { color: tile.statusColor }]}>
                      {tile.statusLabel}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>

              <Text style={styles.tileValue}>{tile.value}</Text>
              <Text style={styles.tileValueLabel}>{tile.valueLabel}</Text>
            </View>

            {/* Watermark icon */}
            <View style={styles.watermarkContainer}>
              <tile.icon
                size={100}
                color={tile.iconColor}
                weight="fill"
                style={{ opacity: tile.watermarkOpacity }}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Directory Section */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Directory</Text>
          <Text style={styles.sectionSubtitle}>
            Karobari Details / Master Data
          </Text>
        </View>

        <View style={styles.directoryGrid}>
          {directorySections.map(section => (
            <TouchableOpacity
              key={section.id}
              style={styles.directoryCard}
              onPress={() => handlePress(section.route)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.directoryIconContainer,
                  { backgroundColor: section.backgroundColor },
                ]}>
                <section.icon
                  size={24}
                  color={section.iconColor}
                  weight="fill"
                />
              </View>
              <Text style={styles.directoryTitle}>{section.title}</Text>
              <Text style={styles.directorySubtitle}>{section.subtitle}</Text>
              <Text style={styles.directoryCount}>{section.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    headerIconText: {
      fontSize: 20,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      letterSpacing: 1,
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
    sectionHeader: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    transactionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadows.sm,
    },
    transactionCardInner: {
      zIndex: 1,
    },
    transactionCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    tileIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    tileBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    tileTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    tileSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 12,
    },
    tileValue: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    tileValueLabel: {
      fontSize: 13,
      color: theme.colors.text.disabled,
      fontStyle: 'italic',
    },
    watermarkContainer: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      zIndex: 0,
    },
    directoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: theme.spacing.xl,
    },
    directoryCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      ...theme.shadows.sm,
    },
    directoryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    directoryTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    directorySubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    directoryCount: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
    },
  });

export default DirectoryScreen;
