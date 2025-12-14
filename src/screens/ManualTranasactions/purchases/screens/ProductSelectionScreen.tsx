// flows/purchase/screens/ProductSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableList from '../../../../components/common/SearchableList';
import { Theme } from '../../../../constants/theme';
import ActionButton from '../../../../components/common/ActionButton';

interface Product {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unit: string;
  purchasePrice: number;
  lastPurchasePrice?: number;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy A54',
    category: 'Electronics',
    stockQuantity: 45,
    unit: 'piece',
    purchasePrice: 75000,
    lastPurchasePrice: 73000,
  },
  {
    id: '2',
    name: 'Office Chair',
    category: 'Furniture',
    stockQuantity: 8,
    unit: 'piece',
    purchasePrice: 12000,
    lastPurchasePrice: 11500,
  },
  {
    id: '3',
    name: 'Rice (Basmati)',
    category: 'Food',
    stockQuantity: 150,
    unit: 'kg',
    purchasePrice: 200,
    lastPurchasePrice: 195,
  },
];

const ProductSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { supplier } = route.params?.flowData || {};
  const [products] = useState<Product[]>(mockProducts);

  const handleProductSelect = (product: Product) => {
    navigateToScreen('PurchaseQuantityPrice', { product , supplier});
  };

  const handleAddProduct = () => {
    navigateToScreen('AddProduct');
  };

  const handleSkipToTotal = () => {
    navigateToScreen('DirectTotal');
  };

  const renderProductItem = (product: Product) => {
    return (
      <View style={styles.productCard}>
        <View style={styles.productIcon}>
          <Text style={styles.productIconText}>📦</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productMeta}>
            <Text style={styles.productStock}>
              Current stock: {product.stockQuantity} {product.unit}
            </Text>
          </View>
          <Text style={styles.productPrice}>
            Last cost: PKR{' '}
            {(
              product.lastPurchasePrice || product.purchasePrice
            ).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Supplier Info */}
      {supplier && (
        <View style={styles.supplierBanner}>
          <Text style={styles.supplierBannerText}>
            Buying from:{' '}
            <Text style={styles.supplierBannerName}>{supplier.name}</Text>
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <SearchableList
          data={products}
          searchPlaceholder="🔍 Search products..."
          searchKey="name"
          onItemPress={handleProductSelect}
          renderItem={renderProductItem}
          sectionHeader="Products:"
          emptyMessage="No products found"
        />
      </View>

      {/* Skip Section */}
      <View style={styles.skipSection}>
        <Text style={styles.dividerText}>OR</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipToTotal}>
          <Text style={styles.skipButtonText}>
            Skip products - Enter bill total directly →
          </Text>
        </TouchableOpacity>
        <Text style={styles.skipInfo}>
          Use this if you want to record just the total amount
        </Text>
      </View>

      {/* Add Product Button */}
      <View style={styles.footer}>
        <ActionButton
          title="+ Add new product"
          onPress={handleAddProduct}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  supplierBanner: {
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  supplierBannerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  supplierBannerName: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  productIconText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  productMeta: {
    marginBottom: theme.spacing.xs,
  },
  productStock: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  productPrice: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  skipSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.text.disabled,
    marginBottom: theme.spacing.sm,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    width: '100%' as const,
    alignItems: 'center' as const,
  },
  skipButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.primary,
  },
  skipInfo: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default ProductSelectionScreen;
