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
  PackageIcon,
  CaretRightIcon,
  PlusIcon,
  CubeIcon,
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
  MagnifyingGlassIcon,
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
import { productsApi, Product } from '../../services/api/products';
import { formatCurrency } from './schemas/productSchemas';

type FilterType = 'all' | 'active' | 'inactive' | 'low_stock';

const ProductsListScreen: React.FC<NavigationProps<'ProductsList'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch products
  const fetchProducts = useCallback(
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
          includeInactive: filter === 'inactive' || filter === 'all',
          page: pageNum,
          limit: 20,
        };

        const { data: response } = await productsApi.getAll(filters);
        console.log(response);
        let filteredData = response.data;

        // Apply local filter for active/inactive
        if (filter === 'active') {
          filteredData = response.data.filter(p => p.isActive);
        } else if (filter === 'inactive') {
          filteredData = response.data.filter(p => !p.isActive);
        }

        if (pageNum === 1) {
          setProducts(filteredData);
        } else {
          setProducts(prev => [...prev, ...filteredData]);
        }

        setHasMore(pageNum < response.totalPages);
        setPage(pageNum);
        setTotalProducts(response.total);

        // Calculate total inventory value
        const value = response.data.reduce(
          (sum, product) => sum + (product.sale_price || 0),
          0,
        );
        setTotalValue(value);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch products',
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
    fetchProducts(1);
  }, [searchQuery, filter]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProducts(1, true);
  };

  // Navigate to product details
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  // Navigate to add product
  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  // Delete product
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsApi.delete(product.id);
              setProducts(prev => prev.filter(p => p.id !== product.id));
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${product.name} has been removed`,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete product',
              });
            }
          },
        },
      ],
    );
  };

  // Render product item
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, !item.isActive && styles.productCardInactive]}
      onPress={() => handleProductPress(item)}
      onLongPress={() => handleDeleteProduct(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.productIcon,
          !item.isActive && styles.productIconInactive,
        ]}
      >
        <PackageIcon
          size={22}
          color={
            item.isActive ? theme.colors.primary : theme.colors.text.disabled
          }
          weight="fill"
        />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text
            style={[styles.productName, !item.isActive && styles.textInactive]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.productCode && (
            <View style={styles.skuBadge}>
              <Text style={styles.skuText}>{item.productCode}</Text>
            </View>
          )}
        </View>
        <View style={styles.productMeta}>
          <Text style={styles.priceText}>
            {formatCurrency(Number(item.defaultSellingPrice))}
          </Text>
          {!item.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.productActions}>
        <Text style={styles.purchasePrice}>
          Cost: {formatCurrency(Number(item.defaultPurchasePrice))}
        </Text>
        <CaretRightIcon size={16} color={theme.colors.text.disabled} />
      </View>
    </TouchableOpacity>
  );

  // Render summary header
  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <CubeIcon size={24} color={theme.colors.primary} weight="fill" />
        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>{totalProducts}</Text>
          <Text style={styles.summaryLabel}>Total Products</Text>
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
        <Text
          style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'active' && styles.filterTabActive,
        ]}
        onPress={() => setFilter('active')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'active' && styles.filterTextActive,
          ]}
        >
          Active
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'inactive' && styles.filterTabActive,
        ]}
        onPress={() => setFilter('inactive')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'inactive' && styles.filterTextActive,
          ]}
        >
          Inactive
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render list loading state
  const renderListLoading = () => (
    <View style={styles.listLoadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.listLoadingText}>Loading products...</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (listLoading) {
      return renderListLoading();
    }

    return (
      <View style={styles.emptyContainer}>
        <PackageIcon
          size={64}
          color={theme.colors.text.disabled}
          weight="light"
        />
        <Text style={styles.emptyTitle}>No Products Found</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No products match "${searchQuery}"`
            : 'Add your first product to get started'}
        </Text>
        {!searchQuery && (
          <Button
            title="Add Product"
            onPress={handleAddProduct}
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
        title="Inventory"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
            activeOpacity={0.7}
          >
            <PlusIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products by name, SKU..."
        />
      </View>

      {renderFilters()}

      <FlatList
        data={listLoading ? [] : products}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        ListHeaderComponent={
          !listLoading && products.length > 0 ? renderHeader : null
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          (products.length === 0 || listLoading) && styles.emptyListContent,
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
        onPress={handleAddProduct}
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
    productCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    productCardInactive: {
      opacity: 0.7,
    },
    productIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    productIconInactive: {
      backgroundColor: theme.colors.divider,
    },
    productInfo: {
      flex: 1,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: 4,
    },
    productName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      flex: 1,
    },
    textInactive: {
      color: theme.colors.text.secondary,
    },
    skuBadge: {
      backgroundColor: theme.colors.divider,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    skuText: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    productMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    priceText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    inactiveBadge: {
      backgroundColor: `${theme.colors.error}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    inactiveBadgeText: {
      fontSize: 10,
      color: theme.colors.error,
      fontWeight: '500',
    },
    productActions: {
      alignItems: 'flex-end',
      marginLeft: theme.spacing.sm,
    },
    purchasePrice: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 4,
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

export default ProductsListScreen;
