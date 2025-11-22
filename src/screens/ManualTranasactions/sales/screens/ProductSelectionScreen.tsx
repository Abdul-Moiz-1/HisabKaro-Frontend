// flows/sales/screens/ProductSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import SearchableList from '../../../../components/common/SearchableList';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Product {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unit: string;
  salePrice: number;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy A54',
    category: 'Electronics',
    stockQuantity: 45,
    unit: 'piece',
    salePrice: 85000,
  },
  {
    id: '2',
    name: 'Office Chair',
    category: 'Furniture',
    stockQuantity: 8,
    unit: 'piece',
    salePrice: 15000,
  },
  {
    id: '3',
    name: 'Rice (Basmati)',
    category: 'Food',
    stockQuantity: 150,
    unit: 'kg',
    salePrice: 250,
  },
  {
    id: '4',
    name: 'HP Laptop',
    category: 'Electronics',
    stockQuantity: 0,
    unit: 'piece',
    salePrice: 120000,
  },
];

const ProductSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { customer } = route.params?.flowData || {};
  const [products] = useState<Product[]>(mockProducts);

  const handleProductSelect = (product: Product) => {
    navigateToScreen('ProductQuantityPrice', { product });
  };

  const handleAddProduct = () => {
    navigateToScreen('AddProduct');
  };

  const handleSkipToTotal = () => {
    navigateToScreen('DirectTotal');
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return '#8E8E93';
    if (quantity < 10) return '#FF3B30';
    if (quantity < 50) return '#FF9500';
    return '#34C759';
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
            <Text
              style={[
                styles.productStock,
                { color: getStockColor(product.stockQuantity) },
              ]}
            >
              Stock: {product.stockQuantity} {product.unit}
            </Text>
            <Text style={styles.productPrice}>
              PKR {product.salePrice.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
            Skip product selection - Enter total directly →
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  productStock: {
    ...theme.typography.caption,
    fontWeight: '600' as const,
  },
  productPrice: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
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
