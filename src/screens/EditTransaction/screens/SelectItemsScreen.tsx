// flows/editTransaction/screens/SelectItemsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Icon from '../../../components/Icon';
import { useThemedStyles } from '../../../theme';
import { useFlowNavigation } from '../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountInputField } from '../../../components/DynamicForm';
import { FieldType } from '../../../types/forms';
import ActionButton from '../../../components/common/ActionButton';
import SearchableList from '../../../components/common/SearchableList';
import { Theme } from '../../../constants/theme';

interface Product {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unit: string;
  salePrice: number;
  purchasePrice: number;
}

interface CartItem extends Product {
  quantity: number;
  price: number;
  total: number;
}

// Mock products
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy A54',
    category: 'Smartphones',
    stockQuantity: 25,
    unit: 'pcs',
    salePrice: 75000,
    purchasePrice: 68000,
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    category: 'Smartphones',
    stockQuantity: 10,
    unit: 'pcs',
    salePrice: 450000,
    purchasePrice: 425000,
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24',
    category: 'Smartphones',
    stockQuantity: 15,
    unit: 'pcs',
    salePrice: 285000,
    purchasePrice: 270000,
  },
];

const SelectItemsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen, goBack } = useFlowNavigation();

  // @ts-ignore
  const { currentItems, transactionType } = route.params?.flowData || {};

  const [products] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>(currentItems || []);
  const [showProductList, setShowProductList] = useState(true);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const handleProductSelect = (product: Product) => {
    // Check if product already in cart
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
      // Edit existing item
      setEditingItem(existingItem);
      setShowProductList(false);
    } else {
      // Add new item with default values
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        price:
          transactionType === 'sale'
            ? product.salePrice
            : product.purchasePrice,
        total:
          transactionType === 'sale'
            ? product.salePrice
            : product.purchasePrice,
      };
      setEditingItem(newItem);
      setShowProductList(false);
    }
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    const updatedItem = {
      ...editingItem,
      total: editingItem.quantity * editingItem.price,
    };

    // Check if item exists in cart
    const existingIndex = cartItems.findIndex(
      item => item.id === updatedItem.id,
    );

    if (existingIndex !== -1) {
      // Update existing item
      const newCart = [...cartItems];
      newCart[existingIndex] = updatedItem;
      setCartItems(newCart);
    } else {
      // Add new item
      setCartItems([...cartItems, updatedItem]);
    }

    setEditingItem(null);
    setShowProductList(true);
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleEditCartItem = (item: CartItem) => {
    setEditingItem(item);
    setShowProductList(false);
  };

  const handleConfirm = () => {
    goBack();
    // goBack({ items: cartItems });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const renderProductItem = (product: Product) => {
    const inCart = cartItems.some(item => item.id === product.id);
    const stockColor =
      product.stockQuantity > 50
        ? '#34C759'
        : product.stockQuantity > 10
        ? '#FF9500'
        : product.stockQuantity > 0
        ? '#FF3B30'
        : '#8E8E93';

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <View style={styles.productDetails}>
            <View style={styles.stockBadge}>
              <View
                style={[styles.stockDot, { backgroundColor: stockColor }]}
              />
              <Text style={styles.stockText}>
                Stock: {product.stockQuantity} {product.unit}
              </Text>
            </View>
            <Text style={styles.productPrice}>
              PKR{' '}
              {(transactionType === 'sale'
                ? product.salePrice
                : product.purchasePrice
              ).toLocaleString()}
            </Text>
          </View>
        </View>
        {inCart && (
          <View style={styles.inCartBadge}>
            <Text style={styles.inCartText}>In Cart</Text>
          </View>
        )}
      </View>
    );
  };

  if (!showProductList && editingItem) {
    // Item Edit Screen
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.editContent}>
          <View style={styles.editHeader}>
            <Text style={styles.editTitle}>Edit Item Details</Text>
            <Text style={styles.editProductName}>{editingItem.name}</Text>
          </View>

          {/* Quantity */}
          <View style={styles.editField}>
            <Text style={styles.fieldLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setEditingItem({
                    ...editingItem,
                    quantity: Math.max(1, editingItem.quantity - 1),
                  })
                }
              >
                <Icon name="remove" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{editingItem.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setEditingItem({
                    ...editingItem,
                    quantity: editingItem.quantity + 1,
                  })
                }
              >
                <Icon name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.editField}>
            <Text style={styles.fieldLabel}>Price per unit</Text>
            <AmountInputField
              field={{
                id: 'price',
                name: 'price',
                label: '',
                type: FieldType.AMOUNT,
              }}
              value={editingItem.price.toString()}
              onChange={value =>
                setEditingItem({ ...editingItem, price: Number(value) })
              }
              quickAmounts={[]}
              onBlur={() => {}}
            />
          </View>

          {/* Total */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              PKR {(editingItem.quantity * editingItem.price).toLocaleString()}
            </Text>
          </View>

          {/* Stock Warning */}
          {transactionType === 'sale' &&
            editingItem.quantity > editingItem.stockQuantity && (
              <View style={styles.warningCard}>
                <Icon name="warning" size={20} color="#FF9500" />
                <Text style={styles.warningText}>
                  Quantity exceeds available stock ({editingItem.stockQuantity}{' '}
                  {editingItem.unit})
                </Text>
              </View>
            )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditingItem(null);
              setShowProductList(true);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.footerSpacer} />
          <ActionButton
            title="Save Item"
            onPress={handleSaveItem}
            disabled={editingItem.quantity === 0 || editingItem.price === 0}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main Screen - Product List & Cart
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <View style={styles.cartSummary}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>
                🛒 Shopping Cart ({cartItems.length} items)
              </Text>
              <Text style={styles.cartTotal}>
                PKR {calculateTotal().toLocaleString()}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cartItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cartItemChip}
                  onPress={() => handleEditCartItem(item)}
                >
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cartItemQuantity}>
                    {item.quantity}× PKR {item.price.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Icon name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Product List */}
        <SearchableList
          data={products}
          searchPlaceholder="🔍 Search products..."
          searchKey="name"
          onItemPress={handleProductSelect}
          renderItem={renderProductItem}
          sectionHeader="Select Products:"
          emptyMessage="No products found"
        />
      </View>

      <View style={styles.footer}>
        <ActionButton
          title="+ Add New Product"
          onPress={() => navigateToScreen('AddProduct')}
          variant="outline"
        />
        <View style={styles.footerSpacer} />
        <ActionButton
          title={`Confirm (${cartItems.length})`}
          onPress={handleConfirm}
          disabled={cartItems.length === 0}
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
  cartSummary: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cartHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  cartTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  cartTotal: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  cartItemChip: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minWidth: 120,
    position: 'relative' as const,
  },
  cartItemName: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  cartItemQuantity: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
  },
  productCard: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  productCategory: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  productDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  stockBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  productPrice: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  inCartBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  inCartText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  editContent: {
    padding: theme.spacing.md,
  },
  editHeader: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  editTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  editProductName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  editField: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
  },
  quantityControl: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: theme.spacing.lg,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quantityValue: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
    minWidth: 60,
    textAlign: 'center' as const,
  },
  totalCard: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  totalValue: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  warningCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#FF9500' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF9500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default SelectItemsScreen;
