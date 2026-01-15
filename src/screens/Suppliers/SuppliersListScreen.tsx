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
  CaretRightIcon,
  PhoneIcon,
  TruckIcon,
  CurrencyCircleDollarIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, SearchBar, Button } from '../../components/common';
import { useTheme } from '../../store/hooks';
import { suppliersApi, Supplier } from '../../services/api';

type FilterType = 'all' | 'with_payables' | 'no_payables';

const SuppliersListScreen: React.FC<NavigationProps<'SuppliersList'>> = ({ navigation }) => {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPayables, setTotalPayables] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filters = {
        search: searchQuery || undefined,
        min_balance: filter === 'with_payables' ? 1 : undefined,
        max_balance: filter === 'no_payables' ? 0 : undefined,
        page: pageNum,
        limit: 20,
        sort_by: 'name' as const,
        sort_order: 'asc' as const,
      };

      const response = await suppliersApi.getAll(filters);

      if (pageNum === 1) {
        setSuppliers(response.data);
      } else {
        setSuppliers(prev => [...prev, ...response.data]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
      setSupplierCount(response.total);

      // Fetch total payables
      if (pageNum === 1) {
        const payables = await suppliersApi.getTotalPayables();
        setTotalPayables(payables.total);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch suppliers',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    fetchSuppliers(1);
  }, [searchQuery, filter]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSuppliers(page + 1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSuppliers(1, true);
  };

  // Navigate to supplier details
  const handleSupplierPress = (supplier: Supplier) => {
    navigation.navigate('SupplierDetail', { supplierId: supplier.id });
  };

  // Navigate to add supplier
  const handleAddSupplier = () => {
    navigation.navigate('AddSupplier');
  };

  // Delete supplier
  const handleDeleteSupplier = (supplier: Supplier) => {
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplier.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await suppliersApi.delete(supplier.id);
              setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${supplier.name} has been removed`,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete supplier',
              });
            }
          },
        },
      ]
    );
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `PKR ${amount.toLocaleString()}`;
  };

  // Render supplier item
  const renderSupplier = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => handleSupplierPress(item)}
      onLongPress={() => handleDeleteSupplier(item)}
      activeOpacity={0.7}
    >
      <View style={styles.supplierAvatar}>
        <TruckIcon size={22} color={theme.colors.warning} weight="fill" />
      </View>
      
      <View style={styles.supplierInfo}>
        <Text style={styles.supplierName}>{item.name}</Text>
        <View style={styles.supplierMeta}>
          {item.phone && (
            <View style={styles.metaItem}>
              <PhoneIcon size={12} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>{item.phone}</Text>
            </View>
          )}
          {item.city && (
            <Text style={styles.cityText}>{item.city}</Text>
          )}
        </View>
      </View>

      <View style={styles.supplierBalance}>
        <Text style={[
          styles.balanceAmount,
          item.payable_balance > 0 ? styles.balancePayable : styles.balanceZero
        ]}>
          {formatCurrency(item.payable_balance)}
        </Text>
        <Text style={styles.balanceLabel}>
          {item.payable_balance > 0 ? 'Payable' : 'Clear'}
        </Text>
      </View>

      <CaretRightIcon size={16} color={theme.colors.text.disabled} />
    </TouchableOpacity>
  );

  // Render summary header
  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <CurrencyCircleDollarIcon size={24} color={theme.colors.warning} weight="fill" />
        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>{formatCurrency(totalPayables)}</Text>
          <Text style={styles.summaryLabel}>Total Payables</Text>
        </View>
      </View>
      <View style={styles.summaryCard}>
        <TruckIcon size={24} color={theme.colors.info} weight="fill" />
        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>{supplierCount}</Text>
          <Text style={styles.summaryLabel}>Total Suppliers</Text>
        </View>
      </View>
    </View>
  );

  // Render filter tabs
  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, filter === 'with_payables' && styles.filterTabActive]}
        onPress={() => setFilter('with_payables')}
      >
        <Text style={[styles.filterText, filter === 'with_payables' && styles.filterTextActive]}>
          With Payables
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, filter === 'no_payables' && styles.filterTabActive]}
        onPress={() => setFilter('no_payables')}
      >
        <Text style={[styles.filterText, filter === 'no_payables' && styles.filterTextActive]}>
          Clear
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <TruckIcon size={64} color={theme.colors.text.disabled} weight="light" />
      <Text style={styles.emptyTitle}>No Suppliers Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No suppliers match "${searchQuery}"`
          : 'Add your first supplier to get started'}
      </Text>
      {!searchQuery && (
        <Button
          title="Add Supplier"
          onPress={handleAddSupplier}
          variant="primary"
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  // Render loading footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Suppliers"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading suppliers...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Suppliers"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSupplier}
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
          placeholder="Search suppliers by name, phone..."
        />
      </View>

      {renderFilters()}

      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        renderItem={renderSupplier}
        ListHeaderComponent={suppliers.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          suppliers.length === 0 && styles.emptyListContent,
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
    supplierCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    supplierAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${theme.colors.warning}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    supplierMeta: {
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
    supplierBalance: {
      alignItems: 'flex-end',
      marginRight: theme.spacing.sm,
    },
    balanceAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    balancePayable: {
      color: theme.colors.warning,
    },
    balanceZero: {
      color: theme.colors.success,
    },
    balanceLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
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
  });

export default SuppliersListScreen;
