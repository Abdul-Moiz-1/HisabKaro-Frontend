import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  PackageIcon,
  CaretLeftIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
  ArrowsCounterClockwiseIcon,
  ChartLineUpIcon,
  TagIcon,
  CubeIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container } from '../../components/common';
import { useTheme } from '../../store/hooks';
import {
  productsApi,
  Product,
  StockAdjustment,
} from '../../services/api/products';
import { formatCurrency } from './schemas/productSchemas';

const ProductDetailScreen: React.FC<NavigationProps<'ProductDetail'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { productId } = route.params || {};

  const [product, setProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch product details
  const fetchProductDetails = useCallback(
    async (isRefresh: boolean = false) => {
      if (!productId) return;

      try {
        if (!isRefresh) setLoading(true);
        const { data: productData } = await productsApi.getById(productId);

        setProduct(productData);
        // setStockHistory(historyData);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load product details',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductDetails(true);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Handle edit product
  const handleEditProduct = () => {
    setShowMenu(false);
    navigation.navigate('EditProduct', { productId: product?.id || '' });
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsApi.delete(productId!);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${product?.name} has been removed`,
              });
              navigation.goBack();
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

  // Calculate profit margin
  const getProfitMargin = (): number => {
    if (
      !product ||
      !product.defaultPurchasePrice ||
      Number(product.defaultPurchasePrice) === 0
    ) {
      return 0;
    }
    return (
      ((Number(product.defaultSellingPrice) -
        Number(product.defaultPurchasePrice)) /
        Number(product.defaultPurchasePrice)) *
      100
    );
  };

  // Get stock adjustment style
  const getStockAdjustmentStyle = (type: string) => {
    switch (type) {
      case 'in':
        return {
          icon: ArrowDownIcon,
          bgColor: `${theme.colors.success}15`,
          iconColor: theme.colors.success,
          label: 'STOCK IN',
        };
      case 'out':
        return {
          icon: ArrowUpIcon,
          bgColor: `${theme.colors.error}15`,
          iconColor: theme.colors.error,
          label: 'STOCK OUT',
        };
      default:
        return {
          icon: ArrowsCounterClockwiseIcon,
          bgColor: `${theme.colors.info}15`,
          iconColor: theme.colors.info,
          label: 'ADJUSTMENT',
        };
    }
  };

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.errorContainer}>
          <WarningCircleIcon size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The product you're looking for doesn't exist
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const profitMargin = getProfitMargin();

  return (
    <Container safeArea edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <CaretLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <DotsThreeVerticalIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProduct}
            >
              <PencilSimpleIcon size={18} color={theme.colors.text.primary} />
              <Text style={styles.menuItemText}>Edit Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteProduct}
            >
              <TrashIcon size={18} color={theme.colors.error} />
              <Text
                style={[styles.menuItemText, { color: theme.colors.error }]}
              >
                Delete Product
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Product Header Section */}
        <View style={styles.productSection}>
          <View style={styles.productIconContainer}>
            <View
              style={[
                styles.productIconLarge,
                !product.isActive && styles.productIconInactive,
              ]}
            >
              <PackageIcon
                size={48}
                color={
                  product.isActive
                    ? theme.colors.primary
                    : theme.colors.text.disabled
                }
                weight="fill"
              />
            </View>
            {!product.isActive && (
              <View style={styles.inactiveBadgeLarge}>
                <Text style={styles.inactiveBadgeTextLarge}>Inactive</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          {product.productCode && (
            <View style={styles.skuContainer}>
              <TagIcon size={14} color={theme.colors.text.secondary} />
              <Text style={styles.skuLabel}>SKU: {product.productCode}</Text>
            </View>
          )}

          <Text style={styles.priceLabel}>Sale Price</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(Number(product.defaultSellingPrice))}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <CubeIcon size={20} color={theme.colors.info} />
            <Text style={styles.statLabel}>Purchase Price</Text>
            <Text style={styles.statValue}>
              {formatCurrency(Number(product.defaultPurchasePrice))}
            </Text>
          </View>

          <View style={styles.statCard}>
            <ChartLineUpIcon
              size={20}
              color={
                profitMargin > 0 ? theme.colors.success : theme.colors.error
              }
            />
            <Text style={styles.statLabel}>Profit Margin</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    profitMargin > 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {profitMargin.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Product Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Product Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                product.isActive ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  product.isActive
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {formatDate(product.createdAt)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Updated</Text>
            <Text style={styles.detailValue}>
              {formatDate(product.updatedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 50,
      right: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      ...theme.shadows.lg,
      zIndex: 100,
      minWidth: 160,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    menuItemText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    errorTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
    },
    errorSubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    backButton: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    backButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    productSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    productIconContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
    },
    productIconLarge: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    productIconInactive: {
      backgroundColor: theme.colors.divider,
      borderColor: theme.colors.text.disabled,
    },
    inactiveBadgeLarge: {
      position: 'absolute',
      bottom: -8,
      left: '50%',
      transform: [{ translateX: -30 }],
      backgroundColor: theme.colors.error,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.full,
    },
    inactiveBadgeTextLarge: {
      fontSize: 10,
      fontWeight: '600',
      color: '#fff',
    },
    productName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    skuContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: theme.spacing.md,
    },
    skuLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    priceLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    quickActionButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    stockInIcon: {
      backgroundColor: `${theme.colors.success}15`,
    },
    stockOutIcon: {
      backgroundColor: `${theme.colors.error}15`,
    },
    editIcon: {
      backgroundColor: `${theme.colors.primary}15`,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    detailsCard: {
      marginHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    detailsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    statusActive: {
      backgroundColor: `${theme.colors.success}15`,
    },
    statusInactive: {
      backgroundColor: `${theme.colors.error}15`,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statusTextActive: {
      color: theme.colors.success,
    },
    statusTextInactive: {
      color: theme.colors.error,
    },
    historySection: {
      paddingHorizontal: theme.spacing.md,
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    emptyHistory: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyHistoryText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
    },
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    historyContent: {
      flex: 1,
    },
    historyItemTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    historyItemDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    historyQuantity: {
      alignItems: 'flex-end',
    },
    historyQuantityText: {
      fontSize: 15,
      fontWeight: '600',
    },
    historyQuantityLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
  });

export default ProductDetailScreen;
