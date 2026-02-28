import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import {
  productsApi,
  Product,
  UpdateProductPayload,
} from '../../services/api/products';
import {
  editProductSchema,
  EditProductFormData,
  CATEGORY_OPTIONS,
  UNIT_OPTIONS,
} from './schemas/productSchemas';
import {
  TextInputField,
  AmountInputField,
  NumberInputField,
  DropdownField,
  TextAreaField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';

const EditProductScreen: React.FC<NavigationProps<'EditProduct'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { productId } = route.params || {};

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    mode: 'onChange',
  });

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const { data: productData } = await productsApi.getById(productId);
      setProduct(productData);

      // Reset form with product data
      reset({
        name: productData.name,
        sku: productData.productCode || '',

        salePrice: productData.defaultSellingPrice?.toString(),
        purchasePrice: productData.defaultPurchasePrice?.toString() || '',

        isActive: productData.isActive,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load product',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [productId, reset, navigation]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleSaveProduct = async (data: EditProductFormData) => {
    if (!productId) return;

    try {
      setIsSubmitting(true);

      const payload: UpdateProductPayload = {
        name: data.name.trim(),
        productCode: data.sku?.trim() || undefined,
        defaultSellingPrice: parseFloat(data.salePrice),
        defaultPurchasePrice: data.purchasePrice
          ? parseFloat(data.purchasePrice)
          : undefined,
        isActive: data.isActive,
      };

      const { data: updatedProduct } = await productsApi.update(
        productId,
        payload,
      );

      Toast.show({
        type: 'success',
        text1: 'Product Updated',
        text2: `${updatedProduct.name} has been updated successfully`,
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update product',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                    id: 'productName',
                    name: 'productName',
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
                    hint: 'Unique identifier for the product',
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
              name="salePrice"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'salePrice',
                    name: 'salePrice',
                    label: 'Sale Price',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    required: true,
                  }}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.salePrice?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="purchasePrice"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'purchasePrice',
                    name: 'purchasePrice',
                    label: 'Purchase Price (Cost)',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    hint: 'Cost price for profit calculation',
                  }}
                  value={value || ''}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.purchasePrice?.message}
                />
              )}
            />
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⚙️</Text>
              <Text style={styles.sectionTitle}>Status</Text>
            </View>

            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Active Product</Text>
                    <Text style={styles.switchHint}>
                      Inactive products will not appear in sales
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{
                      false: theme.colors.divider,
                      true: `${theme.colors.primary}80`,
                    }}
                    thumbColor={
                      value ? theme.colors.primary : theme.colors.surface
                    }
                  />
                </View>
              )}
            />
          </View>

          {/* Read-only Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>ℹ️</Text>
              <Text style={styles.sectionTitle}>Product Info</Text>
            </View>

            <View style={styles.readOnlyCard}>
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>Product ID</Text>
                <Text style={styles.readOnlyValue}>{product?.id}</Text>
              </View>
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>Created</Text>
                <Text style={styles.readOnlyValue}>
                  {product?.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : '-'}
                </Text>
              </View>
              <View style={[styles.readOnlyRow, styles.readOnlyRowLast]}>
                <Text style={styles.readOnlyLabel}>Last Updated</Text>
                <Text style={styles.readOnlyValue}>
                  {product?.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString()
                    : '-'}
                </Text>
              </View>
            </View>
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
                title={isSubmitting ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit(handleSaveProduct)}
                variant="primary"
                disabled={!isValid || !isDirty || isSubmitting}
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
    readOnlyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    readOnlyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    readOnlyRowLast: {
      borderBottomWidth: 0,
    },
    readOnlyLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    readOnlyValue: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
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
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    switchInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    switchHint: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  });

export default EditProductScreen;
