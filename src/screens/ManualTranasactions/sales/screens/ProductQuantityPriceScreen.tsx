// flows/sales/screens/ProductQuantityPriceScreen.tsx
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useAppDispatch } from '../../../../store/hooks';
import { addItem } from '../../../../store/slices/salesSlice';
import {
  quantityPriceSchema,
  QuantityPriceFormValues,
} from '../schemas/salesSchemas';
import { Product } from '../../../../services/api/products';
import {
  AmountInputField,
  NumberInputField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { FieldType } from '../../../../types/forms';
import Icon from '../../../../components/Icon';
import { formatCurrency } from '../../../../utils';

type RouteParams = {
  ProductQuantityPrice: {
    product: Product;
  };
};

const ProductQuantityPriceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ProductQuantityPrice'>>();
  const dispatch = useAppDispatch();

  const product = route.params?.product;

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<QuantityPriceFormValues>({
    resolver: zodResolver(quantityPriceSchema),
    mode: 'onChange',
    defaultValues: {
      quantity: 1,
      unit_price: Number(product?.defaultSellingPrice) || 0,
      discount: 0,
      discount_type: 'amount',
    },
  });

  // Watch form values for calculations
  const quantity = watch('quantity');
  const unit_price = watch('unit_price');
  const discount = watch('discount') || 0;

  // Calculate totals
  const subtotal = quantity * unit_price;
  const total = subtotal - discount;

  const handleAddToCart = useCallback(
    (data: QuantityPriceFormValues) => {
      if (!product) return;

      dispatch(
        addItem({
          product,
          quantity: data.quantity,
          unit_price: data.unit_price,
        }),
      );

      // Navigate to shopping cart
      // @ts-ignore
      navigation.navigate('ShoppingCart');
    },
    [product, dispatch, navigation],
  );

  const quickQuantities = [1, 2, 5, 10];

  const handleQuickQuantity = useCallback(
    (qty: number) => {
      setValue('quantity', qty, { shouldValidate: true });
    },
    [setValue],
  );

  const handleIncrement = useCallback(() => {
    setValue('quantity', quantity + 1, { shouldValidate: true });
  }, [quantity, setValue]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      setValue('quantity', quantity - 1, { shouldValidate: true });
    }
  }, [quantity, setValue]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <Text style={styles.productIconText}>📦</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productOriginalPrice}>
              Default Price: PKR{' '}
              {formatCurrency(
                Number(product.defaultSellingPrice),
              )?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Quantity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrement}
              activeOpacity={0.7}
            >
              <Icon name="remove" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <View style={styles.quantityInputContainer}>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, value } }) => (
                  <NumberInputField
                    field={{
                      id: 'quantity',
                      name: 'quantity',
                      label: '',
                      placeholder: '1',
                      type: FieldType.NUMBER,
                    }}
                    value={value.toString()}
                    onChange={text => onChange(parseInt(text) || 1)}
                    error={errors.quantity?.message}
                    onBlur={() => {}}
                  />
                )}
              />
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
              activeOpacity={0.7}
            >
              <Icon name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Quantity Buttons */}
          <View style={styles.quickQuantities}>
            {quickQuantities.map(qty => (
              <TouchableOpacity
                key={qty}
                style={[
                  styles.quickButton,
                  quantity === qty && styles.quickButtonActive,
                ]}
                onPress={() => handleQuickQuantity(qty)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    quantity === qty && styles.quickButtonTextActive,
                  ]}
                >
                  {qty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price per {product.unit}</Text>
          <Controller
            control={control}
            name="unit_price"
            render={({ field: { onChange, value } }) => (
              <AmountInputField
                field={{
                  id: 'price',
                  name: 'price',
                  label: '',
                  type: FieldType.AMOUNT,
                  placeholder: '0',
                  suffix: 'PKR',
                }}
                value={value.toString()}
                onChange={text => onChange(parseFloat(text) || 0)}
                error={errors.unit_price?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>

        {/* Discount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount (optional)</Text>
          <Controller
            control={control}
            name="discount"
            render={({ field: { onChange, value } }) => (
              <AmountInputField
                field={{
                  id: 'discount',
                  name: 'discount',
                  label: '',
                  type: FieldType.AMOUNT,
                  placeholder: '0',
                  suffix: 'PKR',
                }}
                value={value?.toString() || '0'}
                onChange={text => onChange(parseFloat(text) || 0)}
                error={errors.discount?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>

        {/* Calculation Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({quantity} × PKR {unit_price.toLocaleString()})
            </Text>
            <Text style={styles.summaryValue}>
              PKR {subtotal.toLocaleString()}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                - PKR {discount.toLocaleString()}
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
          onPress={handleSubmit(handleAddToCart)}
          disabled={!isValid || quantity <= 0 || unit_price <= 0}
        />
      </View>
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      textAlign: 'center',
    },
    productCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    productIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    productIconText: {
      fontSize: 32,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    productStock: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    productOriginalPrice: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    quantityButton: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    quantityInputContainer: {
      flex: 1,
    },
    quickQuantities: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    quickButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
    },
    quickButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quickButtonText: {
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    quickButtonTextActive: {
      color: '#FFFFFF',
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: 13,
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
      fontSize: 20,
      color: theme.colors.primary,
      fontWeight: '700',
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
      ...theme.shadows.sm,
    },
  });

export default ProductQuantityPriceScreen;
