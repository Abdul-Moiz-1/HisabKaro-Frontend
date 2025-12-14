// flows/sales/screens/ProductQuantityPriceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../../../theme';
import {
  AmountInputField,
  NumberInputField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesFlow } from '../context/SalesFlowContext';

const ProductQuantityPriceScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { data, addToCart } = useSalesFlow();

  const product = data.currentProduct;

  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState(product?.salePrice?.toString() || '');
  const [discount, setDiscount] = useState('0');

  const subtotal = parseFloat(quantity || '0') * parseFloat(price || '0');
  const discountAmount = parseFloat(discount || '0');
  const total = subtotal - discountAmount;

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      ...product,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      discount: discountAmount,
      total: total
    };
    
    addToCart(cartItem);
    // @ts-ignore
    navigation.navigate('ShoppingCart');
  };

  const quickQuantities = [1, 2, 5, 10];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <Text style={styles.productIconText}>📦</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product?.name}</Text>
            <Text style={styles.productStock}>
              Available: {product?.stockQuantity} {product?.unit}
            </Text>
            <Text style={styles.productOriginalPrice}>
              Default Price: PKR {product?.salePrice?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Quantity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(Math.max(1, parseInt(quantity) - 1).toString())
              }
            >
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>

            <View style={styles.quantityInputContainer}>
              <NumberInputField
                field={{
                  id: 'quality',
                  name: 'quality',
                  label: '',
                  placeholder: '1',
                  type: FieldType.NUMBER,
                }}
                value={quantity}
                onChange={setQuantity}
                onBlur={() => {}}
              />
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Quantity Buttons */}
          <View style={styles.quickQuantities}>
            {quickQuantities.map(qty => (
              <TouchableOpacity
                key={qty}
                style={styles.quickButton}
                onPress={() => setQuantity(qty.toString())}
              >
                <Text style={styles.quickButtonText}>{qty}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price per {product?.unit}</Text>
          <AmountInputField
            field={{
              id: 'price',
              name: 'price',
              label: '',
              type: FieldType.AMOUNT,
              placeholder: '0',
              suffix: 'PKR',
            }}
            value={price}
            onChange={setPrice}
            onBlur={() => {}}
          />
        </View>

        {/* Discount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount (optional)</Text>
          <AmountInputField
            field={{
              id: 'discount',
              name: 'discount',
              label: '',
              type: FieldType.AMOUNT,
              placeholder: '0',
              suffix: 'PKR',
            }}
            value={discount}
            onChange={setDiscount}
            onBlur={() => {}}
          />
        </View>

        {/* Calculation Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({quantity} × PKR{' '}
              {parseFloat(price || '0').toLocaleString()})
            </Text>
            <Text style={styles.summaryValue}>
              PKR {subtotal.toLocaleString()}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                - PKR {discountAmount.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Total</Text>
            <Text style={styles.summaryValueBold}>
              PKR {total.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Add to Cart ✓"
          onPress={handleAddToCart}
          disabled={!quantity || !price || parseFloat(quantity) <= 0}
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
    padding: theme.spacing.md,
  },
  productCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  productIconText: {
    fontSize: 32,
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
  productStock: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  productOriginalPrice: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
  },
  quantityControl: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quantityInputContainer: {
    flex: 1,
  },
  quickQuantities: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  quickButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  quickButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  summaryLabelBold: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  summaryValueBold: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  discountValue: {
    color: theme.colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default ProductQuantityPriceScreen;
