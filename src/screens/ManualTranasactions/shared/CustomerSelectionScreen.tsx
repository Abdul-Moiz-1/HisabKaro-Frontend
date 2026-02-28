// shared/CustomerSelectionScreen.tsx
// Reusable customer selection screen for Sales, Receipt, Purchase, Payment flows
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PlusIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CaretRightIcon,
  WarningCircleIcon,
  UserCirclePlusIcon,
  ArrowRightIcon,
  ClockIcon,
} from 'phosphor-react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../../store/hooks';
import { SearchBar } from '../../../components/common';
import { Customer } from '../../../services/api/customers';
import { useCustomerSelectionFlow } from './hooks/useFlowAdapter';
import { FlowType } from '../../../types/trasactions';

type RouteParams = {
  CustomerSelection: {
    flowType?: FlowType;
    nextScreen?: string;
    allowWalkIn?: boolean;
  };
};

const CustomerSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CustomerSelection'>>();

  const {
    flowType = 'sales',
    nextScreen: customNextScreen,
    allowWalkIn,
  } = route.params || {};

  // Use flow adapter hook
  const {
    config,
    customers,
    isLoading,
    error,
    fetchCustomers,
    searchCustomersByQuery,
    selectCustomer,
    handleWalkIn,
    resetFlow,
    clearError,
  } = useCustomerSelectionFlow(flowType);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Determine next screen - custom override or config default
  const nextScreen = customNextScreen || config.nextScreen;

  // Determine if walk-in is allowed
  const showWalkIn =
    allowWalkIn !== undefined ? allowWalkIn : config.showWalkIn;

  // Reset flow and fetch customers on screen focus
  useFocusEffect(
    useCallback(() => {
      if (flowType === 'receipt') {
        resetFlow();
      }
      fetchCustomers();
    }, [flowType, resetFlow, fetchCustomers]),
  );

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomersByQuery(searchQuery);
      } else {
        fetchCustomers();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchCustomersByQuery, fetchCustomers]);

  // Handle error
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCustomers();
    setIsRefreshing(false);
  }, [fetchCustomers]);

  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      selectCustomer(customer);

      // @ts-ignore
      navigation.navigate(nextScreen, { customer, flowType });
    },
    [selectCustomer, navigation, nextScreen, flowType],
  );

  const handleWalkInSale = useCallback(() => {
    handleWalkIn();
    // @ts-ignore
    navigation.navigate(nextScreen, { flowType });
  }, [handleWalkIn, navigation, nextScreen, flowType]);

  const handleAddCustomer = useCallback(() => {
    // @ts-ignore - navigating to parent navigator
    navigation.navigate('AddCustomer', { fromFlow: true, flowType });
  }, [navigation, flowType]);

  // Check if a customer's payment is overdue (based on last sale date)
  const isOverdue = useCallback((customer: Customer) => {
    if (!customer?.lastPaymentDate) return false;
    const lastSaleDate = new Date(customer?.lastPaymentDate);
    const creditPeriod = customer?.creditPeriodDays || 30;
    const daysSinceLastSale = Math.floor(
      (Date.now() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLastSale > creditPeriod; // Consider overdue if more than 30 days
  }, []);

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No activity yet';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const renderCustomerItem = useCallback(
    ({ item }: { item: Customer }) => {
      const overdue = config.showOverdueBadge && isOverdue(item);
      const hasOutstanding = item?.totalOutstanding > 0;
      console.log(item);
      return (
        <TouchableOpacity
          style={styles.customerCard}
          onPress={() => handleCustomerSelect(item)}
          activeOpacity={0.7}
        >
          {/* Avatar */}
          <View
            style={[
              styles.customerAvatar,
              overdue && styles.customerAvatarOverdue,
            ]}
          >
            <UserIcon
              size={24}
              color={overdue ? theme.colors.error : theme.colors.primary}
              weight="fill"
            />
          </View>

          {/* Customer Info */}
          <View style={styles.customerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.customerName} numberOfLines={1}>
                {item.name}
              </Text>
              {config.showOverdueBadge && overdue && (
                <View style={styles.overdueBadge}>
                  <WarningCircleIcon size={12} color={theme.colors.error} />
                  <Text style={styles.overdueText}>Overdue</Text>
                </View>
              )}
            </View>

            <View style={styles.customerMeta}>
              {item.phone && (
                <View style={styles.metaItem}>
                  <PhoneIcon size={12} color={theme.colors.text.secondary} />
                  <Text style={styles.metaText}>{item.phone}</Text>
                </View>
              )}
              {item.city && (
                <View style={styles.metaItem}>
                  <MapPinIcon size={12} color={theme.colors.text.secondary} />
                  <Text style={styles.metaText}>{item.city}</Text>
                </View>
              )}
            </View>

            {/* Last activity */}
            <View style={styles.lastActivityRow}>
              <ClockIcon size={12} color={theme.colors.text.disabled} />
              <Text style={styles.lastActivityText}>
                Last: {formatDate(item?.lastPaymentDate)}
              </Text>
            </View>

            {/* Outstanding Badge - shown based on config */}
            {config.showOutstandingBadge && hasOutstanding && (
              <View
                style={[
                  styles.outstandingBadge,
                  overdue && styles.outstandingBadgeOverdue,
                ]}
              >
                <WarningCircleIcon
                  size={14}
                  color={overdue ? theme.colors.error : theme.colors.warning}
                  weight="fill"
                />
                <Text
                  style={[
                    styles.outstandingText,
                    overdue && styles.outstandingTextOverdue,
                  ]}
                >
                  {flowType === 'receipt' ? 'Receivable' : 'Due'}: PKR{' '}
                  {formatCurrency(item?.totalOutstanding)}
                </Text>
              </View>
            )}
          </View>

          {/* Right Section - Amount for receipt flow */}
          {flowType === 'receipt' && hasOutstanding ? (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Outstanding</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  overdue && styles.balanceAmountOverdue,
                ]}
              >
                PKR {formatCurrency(item?.totalOutstanding)}
              </Text>
            </View>
          ) : (
            <CaretRightIcon size={20} color={theme.colors.text.disabled} />
          )}
        </TouchableOpacity>
      );
    },
    [styles, theme, config, flowType, handleCustomerSelect, isOverdue],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UserIcon size={48} color={theme.colors.text.disabled} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No customers found' : config.emptyTitle}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term or add a new customer'
          : config.emptySubtitle}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddCustomer}>
        <PlusIcon size={18} color="#FFFFFF" weight="bold" />
        <Text style={styles.emptyButtonText}>Add Customer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {searchQuery ? 'Search Results' : config.sectionTitle}
      </Text>
      <Text style={styles.sectionCount}>
        {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={config.searchPlaceholder}
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Customers List */}
      {isLoading && customers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={customers.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* Walk-in Sale Section - only for sales flow */}
      {showWalkIn && flowType === 'sales' && (
        <View style={styles.walkInSection}>
          <Text style={styles.walkInInfo}>
            Don't have customer details? Use walk-in sale
          </Text>
          <TouchableOpacity
            style={styles.walkInButton}
            onPress={handleWalkInSale}
          >
            <UserCirclePlusIcon
              size={20}
              color={theme.colors.primary}
              weight="bold"
            />
            <Text style={styles.walkInButtonText}>Walk-in Customer</Text>
            <ArrowRightIcon size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add Customer FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddCustomer}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionCount: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    listContent: {
      padding: theme.spacing.md,
      paddingBottom: 200,
      flexGrow: 1,
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
    customerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    customerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    customerAvatarOverdue: {
      backgroundColor: `${theme.colors.error}15`,
    },
    customerInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: 4,
    },
    customerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      flex: 1,
    },
    overdueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.error}15`,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      gap: 2,
    },
    overdueText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.error,
    },
    customerMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: 4,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    lastActivityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    lastActivityText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    outstandingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    outstandingBadgeOverdue: {
      backgroundColor: `${theme.colors.error}15`,
    },
    outstandingText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    outstandingTextOverdue: {
      color: theme.colors.error,
    },
    balanceContainer: {
      alignItems: 'flex-end',
      marginLeft: theme.spacing.sm,
    },
    balanceLabel: {
      fontSize: 10,
      color: theme.colors.text.disabled,
      marginBottom: 2,
    },
    balanceAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    balanceAmountOverdue: {
      color: theme.colors.error,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.lg,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    walkInSection: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
    },
    walkInInfo: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    walkInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      width: '100%',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
    },
    walkInButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    fab: {
      position: 'absolute',
      bottom: 140,
      right: theme.spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
  });

export default CustomerSelectionScreen;
