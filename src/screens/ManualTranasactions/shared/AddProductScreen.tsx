// shared/AddProductScreen.tsx
// Reusable Add Product screen for both Sales and Receipt flows
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../../store/hooks';
import {
  productsApi,
  CreateProductPayload,
} from '../../../services/api/products';
import {
  AmountInputField,
  DropdownField,
  NumberInputField,
  TextInputField,
} from '../../../components/DynamicForm';
import ActionButton from '../../../components/common/ActionButton';
import { FieldType } from '../../../types/forms';

// Product creation schema
const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name is too long'),
  sku: z.string().max(50, 'SKU is too long').optional(),
  category_id: z.string().optional(),
  sale_price: z
    .number()
    .min(0, 'Sale price cannot be negative')
    .refine(val => val > 0, 'Sale price must be greater than 0'),
  purchase_price: z
    .number()
    .min(0, 'Purchase price cannot be negative')
    .optional(),
  unit: z.string().min(1, 'Unit is required'),
  opening_stock: z.number().min(0, 'Stock cannot be negative').optional(),
  min_stock_level: z
    .number()
    .min(0, 'Min stock level cannot be negative')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type RouteParams = {
  AddProduct: {
    flowType?: 'sales' | 'receipt' | 'standalone';
    nextScreen?: string;
  };
};

const AddProductScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AddProduct'>>();

  const { flowType = 'standalone', nextScreen = 'ProductSelection' } =
    route.params || {};

  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      sku: '',
      sale_price: 0,
      purchase_price: 0,
      unit: 'piece',
      opening_stock: 0,
      min_stock_level: 10,
      description: '',
    },
  });

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSaveProduct = useCallback(
    async (data: ProductFormValues) => {
      try {
        setIsSubmitting(true);

        // Prepare API payload
        const payload: CreateProductPayload = {
          name: data.name.trim(),
          sku: data.sku?.trim() || undefined,
          defaultSellingPrice: data.sale_price,
          defaultPurchasePrice: data.purchase_price || 0,
        };

        // Call API to create product
        const newProduct = await productsApi.create(payload);

        Toast.show({
          type: 'success',
          text1: 'Product Added',
          text2: `${newProduct.name} has been added successfully`,
        });

        // Navigate back with the new product
        if (flowType === 'standalone') {
          navigation.goBack();
        } else {
          // @ts-ignore
          navigation.navigate(nextScreen, { newProduct });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to create product',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [flowType, navigation, nextScreen],
  );

  const categoryOptions = [
    { label: 'Electronics', value: '1' },
    { label: 'Furniture', value: '2' },
    { label: 'Food & Beverages', value: '3' },
    { label: 'Clothing', value: '4' },
    { label: 'Stationery', value: '5' },
    { label: 'Other', value: '6' },
  ];

  const unitOptions = [
    { label: 'Piece', value: 'piece' },
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Liter (L)', value: 'liter' },
    { label: 'Meter (m)', value: 'meter' },
    { label: 'Box', value: 'box' },
    { label: 'Carton', value: 'carton' },
    { label: 'Dozen', value: 'dozen' },
    { label: 'Pack', value: 'pack' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📦</Text>
              <Text style={styles.sectionTitle}>Product Information</Text>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'name',
                    name: 'name',
                    label: 'Product Name',
                    type: FieldType.TEXT,
                    placeholder: 'Enter product name',
                    required: true,
                  }}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="sku"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'sku',
                    name: 'sku',
                    label: 'SKU / Product Code',
                    type: FieldType.TEXT,
                    placeholder: 'Enter SKU (optional)',
                  }}
                  value={value || ''}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.sku?.message}
                />
              )}
            />
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>Pricing</Text>
            </View>

            <Controller
              control={control}
              name="sale_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'sale_price',
                    name: 'sale_price',
                    label: 'Sale Price',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    required: true,
                  }}
                  value={value.toString()}
                  onChange={text => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.sale_price?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="purchase_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'purchase_price',
                    name: 'purchase_price',
                    label: 'Purchase Price',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    hint: 'Cost price for profit calculation',
                  }}
                  value={value?.toString() || '0'}
                  onChange={text => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.purchase_price?.message}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <View style={styles.buttonHalf}>
              <ActionButton
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                disabled={isSubmitting}
              />
            </View>
            <View style={styles.buttonHalf}>
              <ActionButton
                title={isSubmitting ? 'Saving...' : '✓ Save Product'}
                onPress={handleSubmit(handleSaveProduct)}
                variant="primary"
                disabled={!isValid || isSubmitting}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionIcon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    buttonHalf: {
      flex: 1,
    },
  });

export default AddProductScreen;
