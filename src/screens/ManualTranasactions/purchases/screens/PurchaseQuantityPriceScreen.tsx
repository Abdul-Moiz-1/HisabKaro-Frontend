// flows/purchase/screens/PurchaseQuantityPriceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';


import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountInputField,
  NumberInputField,
} from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

const PurchaseQuantityPriceScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { product, bill = [], supplier } = route.params?.flowData || {};

  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState(product?.purchasePrice?.toString() || '');

  const total = parseFloat(quantity || '0') * parseFloat(cost || '0');
  const stockAfterPurchase =
    (product?.stockQuantity || 0) + parseInt(quantity || '0');

  const handleAddToBill = () => {
    const billItem = {
      ...product,
      quantity: parseInt(quantity),
      cost: parseFloat(cost),
      total: total,
    };

    const updatedBill = [...bill, billItem];
    navigateToScreen('PurchaseBillSummary', { bill: updatedBill, supplier });
  };

  const quickQuantities = [1, 5, 10, 20, 50];

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
              Current stock: {product?.stockQuantity} {product?.unit}
            </Text>
            {product?.lastPurchasePrice && (
              <Text style={styles.productLastCost}>
                Last cost: PKR {product.lastPurchasePrice.toLocaleString()}
              </Text>
            )}
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
              <Icon name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>

            <View style={styles.quantityInputContainer}>
              <NumberInputField
                field={{
                  id: 'quantity',
                  name: 'quantity',
                  label: '',
                  placeholder: '1',
                  type: FieldType.NUMBER,
                }}
                value={quantity}
                onChange={setQuantity}
                onBlur={() => { }}
              />
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
            >
              <Icon name="add" size={24} color="#007AFF" />
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

        {/* Cost Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost per {product?.unit}</Text>
          <AmountInputField
            field={{
              id: 'unit',
              name: 'unit',
              label: '',
              placeholder: '0',
              type: FieldType.AMOUNT,
              suffix: 'PKR',
            }}
            value={cost}
            onChange={setCost}
            onBlur={() => { }}
          />
        </View>

        {/* Stock Impact */}
        <View style={styles.stockImpactCard}>
          <View style={styles.stockImpactRow}>
            <Text style={styles.stockImpactLabel}>Current Stock:</Text>
            <Text style={styles.stockImpactValue}>
              {product?.stockQuantity} {product?.unit}
            </Text>
          </View>
          <Icon name="arrow-down" size={20} color="#34C759" />
          <View style={styles.stockImpactRow}>
            <Text style={styles.stockImpactLabel}>After Purchase:</Text>
            <Text style={[styles.stockImpactValue, styles.stockImpactIncrease]}>
              {stockAfterPurchase} {product?.unit}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <ActionButton
            title="Add to Bill"
            onPress={handleAddToBill}
            disabled={!quantity || !cost || parseFloat(quantity) <= 0}
            variant="primary"
          />
        </View>
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
  productLastCost: {
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
  stockImpactCard: {
    backgroundColor: '#34C759' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  stockImpactRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    paddingVertical: theme.spacing.xs,
  },
  stockImpactLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  stockImpactValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  stockImpactIncrease: {
    color: '#34C759',
  },
  totalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center' as const,
    ...theme.shadows.sm,
  },
  totalLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  totalValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButtons: {
    gap: theme.spacing.sm,
  },
});

export default PurchaseQuantityPriceScreen;
