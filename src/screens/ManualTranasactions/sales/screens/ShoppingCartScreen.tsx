// flows/sales/screens/ShoppingCartScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';


import { useThemedStyles } from '../../../../theme';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSalesFlow } from '../context/SalesFlowContext';
import Icon from '../../../../components/Icon';

const ShoppingCartScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { data, removeFromCart } = useSalesFlow();

  const cart = data.cart;
  const customer = data.customer;
  const cartTotal = data.cartTotal;

  const handleAddMoreProducts = () => {
    // @ts-ignore
    navigation.navigate('ProductSelection');
  };

  const handleContinue = () => {
    // @ts-ignore
    navigation.navigate('CreditTerms');
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Info */}
        {customer && (
          <View style={styles.customerCard}>
            <Icon name="person" size={20} color="#007AFF" />
            <Text style={styles.customerName}>{customer.name}</Text>
          </View>
        )}

        {/* Cart Items */}
        <Text style={styles.sectionTitle}>Cart Items ({cart.length})</Text>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Icon name="cart-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMoreProducts}
            >
              <Text style={styles.addButtonText}>+ Add products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cart.map((item: any, index: number) => (
              <View key={index} style={styles.cartItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Icon name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>
                    Qty: {item.quantity} {item.unit}
                  </Text>
                  <Text style={styles.itemDetail}>
                    @ PKR {item.price.toLocaleString()}
                  </Text>
                </View>

                {item.discount > 0 && (
                  <Text style={styles.itemDiscount}>
                    Discount: - PKR {item.discount.toLocaleString()}
                  </Text>
                )}

                <View style={styles.itemFooter}>
                  <Text style={styles.itemSubtotal}>
                    Subtotal: PKR{' '}
                    {(item.quantity * item.price).toLocaleString()}
                  </Text>
                  <Text style={styles.itemTotal}>
                    PKR {item.total.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Add More Button */}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddMoreProducts}
            >
              <Icon name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addMoreText}>Add more products</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Summary Card */}
        {cart.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items</Text>
              <Text style={styles.summaryValue}>{cart.length}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
              <Text style={styles.summaryValue}>
                {cart.reduce(
                  (sum: number, item: any) => sum + item.quantity,
                  0,
                )}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Cart Total</Text>
              <Text style={styles.summaryValueBold}>
                PKR {cartTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.footer}>
          <ActionButton
            title="Continue to Payment →"
            onPress={handleContinue}
          />
        </View>
      )}
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
  customerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  customerName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  emptyCart: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  cartItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row' as const,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  itemDetail: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  itemDiscount: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  itemSubtotal: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  itemTotal: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700' as const,
  },
  addMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addMoreText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
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

export default ShoppingCartScreen;
