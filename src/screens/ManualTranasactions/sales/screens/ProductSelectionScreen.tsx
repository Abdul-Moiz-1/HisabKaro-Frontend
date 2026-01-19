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
import { useNavigation } from '@react-navigation/native';
import {
  PlusIcon,
  PackageIcon,
  CaretRightIcon,
  WarningCircleIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import { SearchBar } from '../../../../components/common';
import { Product } from '../../../../services/api/products';
import {
  fetchSalesProducts,
  searchSalesProducts,
  addItem,
  setDirectTotalMode,
  selectSalesProducts,
  selectSelectedCustomer,
  selectIsWalkInSale,
  selectSaleItems,
  selectSalesError,
  clearError,
} from '../../../../store/slices/salesSlice';

const ProductSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectSelectedCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);
  const products = useAppSelector(selectSalesProducts);
  const cartItems = useAppSelector(selectSaleItems);
  const productsLoading = useAppSelector(state => state.sales.productsLoading);
  const error = useAppSelector(selectSalesError);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  console.log('HERER');

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchSalesProducts());
  }, [dispatch]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchSalesProducts(searchQuery));
      } else {
        dispatch(fetchSalesProducts());
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch]);

  // Handle error
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchSalesProducts());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleProductSelect = useCallback(
    (product: Product) => {
      // @ts-ignore
      navigation.navigate('ProductQuantityPrice', { product });
    },
    [navigation],
  );

  const handleQuickAdd = useCallback(
    (product: Product) => {
      dispatch(addItem({ product, quantity: 1 }));
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
        text2: `${product.name} x1`,
        visibilityTime: 1500,
      });
    },
    [dispatch],
  );

  const handleAddProduct = useCallback(() => {
    // @ts-ignore
    navigation.navigate('AddProduct');
  }, [navigation]);

  const handleSkipToTotal = useCallback(() => {
    dispatch(setDirectTotalMode(true));
    // @ts-ignore
    navigation.navigate('DirectTotal');
  }, [dispatch, navigation]);

  const handleViewCart = useCallback(() => {
    // @ts-ignore
    navigation.navigate('ShoppingCart');
  }, [navigation]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString();
  };

  const getItemInCart = (productId: string) => {
    return cartItems.find(item => item.product_id === productId);
  };

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => {
      const cartItem = getItemInCart(item.id);

      return (
        <TouchableOpacity
          style={[styles.productCard]}
          onPress={() => handleProductSelect(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.productIcon]}>
            <PackageIcon size={24} color={theme.colors.primary} weight="fill" />
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={[styles.productName]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.productCode && (
                <Text style={styles.productSku}>{item.productCode}</Text>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.productPrice]}>
                PKR {formatCurrency(Number(item.defaultSellingPrice))}
              </Text>
            </View>

            {cartItem && (
              <View style={styles.inCartBadge}>
                <Text style={styles.inCartText}>
                  In cart: {cartItem.quantity}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PlusIcon size={20} color={theme.colors.primary} weight="bold" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [styles, theme, cartItems, handleProductSelect, handleQuickAdd],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <PackageIcon size={48} color={theme.colors.text.disabled} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No products found' : 'No products yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term or add a new product'
          : 'Add your first product to get started'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddProduct}>
        <PlusIcon size={18} color="#FFFFFF" weight="bold" />
        <Text style={styles.emptyButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Customer Banner */}
      <View style={styles.customerBanner}>
        <Text style={styles.customerBannerText}>
          Selling to:{' '}
          <Text style={styles.customerBannerName}>
            {isWalkIn ? 'Walk-in Customer' : customer?.name || 'N/A'}
          </Text>
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, SKU, or barcode..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'Products'}
        </Text>
        <Text style={styles.sectionCount}>{products.length} products</Text>
      </View>

      {/* Products List */}
      {productsLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

      {/* Skip to Direct Total */}
      <View style={styles.skipSection}>
        <Text style={styles.dividerText}>OR</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipToTotal}>
          <Text style={styles.skipButtonText}>
            Skip products - Enter total directly
          </Text>
          <ArrowRightIcon size={18} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Cart Summary / Proceed Button */}
      {cartItemsCount > 0 && (
        <TouchableOpacity style={styles.cartSummary} onPress={handleViewCart}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <ShoppingCartIcon size={18} color="#FFFFFF" weight="fill" />
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{cartItemsCount}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.cartLabel}>View Cart</Text>
              <Text style={styles.cartTotal}>
                PKR {formatCurrency(cartTotal)}
              </Text>
            </View>
          </View>
          <View style={styles.cartProceed}>
            <Text style={styles.cartProceedText}>Proceed</Text>
            <CaretRightIcon size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Add Product FAB */}
      {cartItemsCount === 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddProduct}
          activeOpacity={0.8}
        >
          <PlusIcon size={24} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    customerBanner: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    customerBannerText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    customerBannerName: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
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
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 200,
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
    productCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    productCardDisabled: {
      opacity: 0.6,
    },
    productIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    productIconDisabled: {
      backgroundColor: theme.colors.divider,
    },
    productIconLowStock: {
      backgroundColor: `${theme.colors.warning}15`,
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
    textDisabled: {
      color: theme.colors.text.disabled,
    },
    productSku: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      backgroundColor: theme.colors.divider,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    productMeta: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: 4,
    },
    productStock: {
      fontSize: 12,
      fontWeight: '500',
    },
    productCategory: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    productPrice: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    lowStockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: 4,
    },
    lowStockText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    inCartBadge: {
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: `${theme.colors.success}15`,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    inCartText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.success,
    },
    quickAddButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
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
    skipSection: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: 'center',
    },
    dividerText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
      marginBottom: theme.spacing.sm,
    },
    skipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      width: '100%',
    },
    skipButtonText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    cartSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primary,
      margin: theme.spacing.md,
      marginTop: 0,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },
    cartInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    cartBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cartCountBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartCountText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    cartLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    cartTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    cartProceed: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cartProceedText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    fab: {
      position: 'absolute',
      bottom: 120,
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

export default ProductSelectionScreen;
