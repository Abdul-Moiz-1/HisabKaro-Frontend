// flows/sales/screens/ShoppingCartScreen.tsx
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UserIcon,
  TrashIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import {
  selectSelectedCustomer,
  selectIsWalkInSale,
  selectSaleItems,
  selectSaleTotals,
  removeItem,
  updateItemQuantity,
} from '../../../../store/slices/salesSlice';
import { Button } from '../../../../components/common';

const ShoppingCartScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectSelectedCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);
  const cartItems = useAppSelector(selectSaleItems);
  const totals = useAppSelector(selectSaleTotals);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAddMoreProducts = useCallback(() => {
    // @ts-ignore
    navigation.navigate('ProductSelection');
  }, [navigation]);

  const handleContinue = useCallback(() => {
    // @ts-ignore
    navigation.navigate('CreditTerms');
  }, [navigation]);

  const handleRemoveItem = useCallback(
    (productId: string) => {
      dispatch(removeItem(productId));
    },
    [dispatch],
  );

  const customerName = isWalkIn
    ? 'Walk-in Customer'
    : customer?.name || 'Unknown';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info */}
        <View style={styles.customerCard}>
          <UserIcon size={20} color={theme.colors.primary} weight="fill" />
          <Text style={styles.customerName}>{customerName}</Text>
        </View>

        {/* Outstanding Balance Warning */}
        {customer && customer.outstanding_balance > 0 && (
          <View style={styles.warningBanner}>
            <WarningCircleIcon
              size={20}
              color={theme.colors.error}
              weight="fill"
            />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Outstanding Balance</Text>
              <Text style={styles.warningText}>
                This customer has PKR{' '}
                {customer.outstanding_balance.toLocaleString()} pending from
                previous sales
              </Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <Text style={styles.sectionTitle}>Cart Items ({cartItems.length})</Text>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCartIcon
              size={64}
              color={theme.colors.text.disabled}
              weight="regular"
            />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMoreProducts}
              activeOpacity={0.7}
            >
              <PlusCircleIcon size={20} color="#FFFFFF" weight="bold" />
              <Text style={styles.addButtonText}>Add products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => (
              <View key={item.product_id} style={styles.cartItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.product_id)}
                    activeOpacity={0.7}
                  >
                    <TrashIcon
                      size={20}
                      color={theme.colors.error}
                      weight="regular"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>
                    Qty: {item.quantity} {item.product.productCode}
                  </Text>
                  <Text style={styles.itemDetail}>
                    @ PKR {item.unit_price.toLocaleString()}
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
                    {(item.quantity * item.unit_price).toLocaleString()}
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
              activeOpacity={0.7}
            >
              <PlusCircleIcon
                size={20}
                color={theme.colors.primary}
                weight="regular"
              />
              <Text style={styles.addMoreText}>Add more products</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Summary Card */}
        {cartItems.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items</Text>
              <Text style={styles.summaryValue}>{cartItems.length}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
              <Text style={styles.summaryValue}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                PKR {totals.subtotal.toLocaleString()}
              </Text>
            </View>

            {totals.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text
                  style={[styles.summaryValue, { color: theme.colors.success }]}
                >
                  - PKR {totals.discount.toLocaleString()}
                </Text>
              </View>
            )}

            {totals.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  PKR {totals.tax.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Cart Total</Text>
              <Text style={styles.summaryValueBold}>
                PKR {totals.grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Continue to Payment →"
            onPress={handleContinue}
            variant="primary"
            size="large"
          />
        </View>
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
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    customerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    customerName: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    emptyCart: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.text.disabled,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
    },
    addButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
    },
    cartItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    itemName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
      flex: 1,
    },
    itemDetails: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    itemDetail: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    itemDiscount: {
      fontSize: 12,
      color: theme.colors.error,
      marginBottom: theme.spacing.xs,
    },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    itemSubtotal: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    itemTotal: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    addMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
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
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    summaryLabelBold: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '700',
    },
    summaryValueBold: {
      fontSize: 22,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.md,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.error}15`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.error,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    warningContent: {
      flex: 1,
    },
    warningTitle: {
      fontSize: 14,
      color: theme.colors.error,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    warningText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      lineHeight: 16,
    },
  });

export default ShoppingCartScreen;
