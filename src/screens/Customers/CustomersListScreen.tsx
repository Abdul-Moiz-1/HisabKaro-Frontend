import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CaretRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyCircleDollarIcon,
  PlusIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import {
  Container,
  HeaderNavigation,
  SearchBar,
  Button,
} from '../../components/common';
import { useTheme } from '../../store/hooks';
import { customersApi, Customer } from '../../services/api';
import { ROUTES } from '../../constants/routes';

type FilterType = 'good' | 'warning' | 'overdue';

const CustomersListScreen: React.FC<NavigationProps<'CustomersList'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [listLoading, setListLoading] = useState(true); // Loading only for list area
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch customers
  const fetchCustomers = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setListLoading(true);
        } else {
          setLoadingMore(true);
        }

        const filters = {
          search: searchQuery || undefined,
          creditStatus: filter,
          page: pageNum,
          limit: 20,
        };

        const response = await customersApi.getAll(filters);

        if (pageNum === 1) {
          setCustomers(response.data);
        } else {
          setCustomers(prev => [...prev, ...response.data]);
        }
        console.log(response);
        setHasMore(pageNum < response.totalPages);
        setPage(pageNum);
        setCustomerCount(response.data.length);

        // Fetch total receivables

        const totalReceivables = response.data.reduce(
          (sum, customer) => sum + Number(customer.totalOutstanding || 0),
          0,
        );
        console.log(totalReceivables);

        setTotalReceivables(totalReceivables);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch customers',
        });
      } finally {
        setListLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, filter],
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [searchQuery, filter]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCustomers(page + 1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCustomers(1, true);
  };

  // Navigate to customer details
  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
  };

  // Navigate to add customer
  const handleAddCustomer = () => {
    navigation.navigate('AddCustomer');
  };

  const handleQuickAdd = useCallback(() => {
    // Show options to add customer, supplier, product, or bank account
    // For now, navigate to add customer as default
    // @ts-ignore
    navigation.navigate(ROUTES.ADD_CUSTOMER, { flowType: 'standalone' });
  }, [navigation]);

  // Delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customersApi.delete(customer.id);
              setCustomers(prev => prev.filter(c => c.id !== customer.id));
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${customer.name} has been removed`,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete customer',
              });
            }
          },
        },
      ],
    );
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `PKR ${amount?.toLocaleString()}`;
  };

  // Render customer item
  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)}
      onLongPress={() => handleDeleteCustomer(item)}
      activeOpacity={0.7}
    >
      <View style={styles.customerAvatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <View style={styles.customerMeta}>
          {item.phone && (
            <View style={styles.metaItem}>
              <PhoneIcon size={12} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>{item.phone}</Text>
            </View>
          )}
          {item.city && <Text style={styles.cityText}>{item.city}</Text>}
        </View>
      </View>

      <View style={styles.customerBalance}>
        <Text
          style={[
            styles.balanceAmount,
            item.totalOutstanding > 0
              ? styles.balancePositive
              : styles.balanceZero,
          ]}
        >
          {formatCurrency(item.totalOutstanding)}
        </Text>
        <Text style={styles.balanceLabel}>
          {item.totalOutstanding > 0 ? 'Receivable' : 'Clear'}
        </Text>
      </View>

      <CaretRightIcon size={16} color={theme.colors.text.disabled} />
    </TouchableOpacity>
  );

  // Render summary header
  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <CurrencyCircleDollarIcon
          size={24}
          color={theme.colors.success}
          weight="fill"
        />
        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>
            {formatCurrency(totalReceivables)}
          </Text>
          <Text style={styles.summaryLabel}>Total Receivables</Text>
        </View>
      </View>
      <View style={styles.summaryCard}>
        <UserPlusIcon size={24} color={theme.colors.info} weight="fill" />
        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>{customerCount}</Text>
          <Text style={styles.summaryLabel}>Total Customers</Text>
        </View>
      </View>
    </View>
  );

  // Render filter tabs
  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, filter === null && styles.filterTabActive]}
        onPress={() => setFilter(null)}
      >
        <Text
          style={[
            styles.filterText,
            filter === null && styles.filterTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'warning' && styles.filterTabActive,
        ]}
        onPress={() => setFilter('warning')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'warning' && styles.filterTextActive,
          ]}
        >
          Warning
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'overdue' && styles.filterTabActive,
        ]}
        onPress={() => setFilter('overdue')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'overdue' && styles.filterTextActive,
          ]}
        >
          Overdue
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render list loading state (shown inside list area)
  const renderListLoading = () => (
    <View style={styles.listLoadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.listLoadingText}>Loading customers...</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    // Show loading in list area
    if (listLoading) {
      return renderListLoading();
    }

    return (
      <View style={styles.emptyContainer}>
        <UserPlusIcon
          size={64}
          color={theme.colors.text.disabled}
          weight="light"
        />
        <Text style={styles.emptyTitle}>No Customers Found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No customers match "${searchQuery}"`
            : 'Add your first customer to get started'}
        </Text>
        {!searchQuery && (
          <Button
            title="Add Customer"
            onPress={handleAddCustomer}
            variant="primary"
            style={styles.emptyButton}
          />
        )}
      </View>
    );
  };

  // Render loading footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Customers"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustomer}
            activeOpacity={0.7}
          >
            <UserPlusIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search customers by name, phone..."
        />
      </View>

      {renderFilters()}

      <FlatList
        data={listLoading ? [] : customers}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        ListHeaderComponent={!listLoading && customers.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          (customers.length === 0 || listLoading) && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleQuickAdd}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
    },
    filterText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    summaryContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
    },
    summaryText: {
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
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    emptyListContent: {
      flex: 1,
    },
    customerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    customerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    customerInfo: {
      flex: 1,
    },
    customerName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    customerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
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
    cityText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    customerBalance: {
      alignItems: 'flex-end',
      marginRight: theme.spacing.sm,
    },
    balanceAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    balancePositive: {
      color: theme.colors.error,
    },
    balanceZero: {
      color: theme.colors.success,
    },
    balanceLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    listLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    listLoadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      minWidth: 160,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
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

export default CustomersListScreen;
