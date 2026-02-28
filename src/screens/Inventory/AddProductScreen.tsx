import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import { productsApi, CreateProductPayload } from '../../services/api/products';
import {
  addProductSchema,
  AddProductFormData,
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

const AddProductScreen: React.FC<NavigationProps<'AddProduct'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fromFlow } = route.params || {};
  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      sku: '',
      salePrice: '',
      purchasePrice: '',
    },
  });

  const handleSaveProduct = async (data: AddProductFormData) => {
    try {
      setIsSubmitting(true);

      const payload: CreateProductPayload = {
        name: data.name.trim(),
        sku: data.sku?.trim() || undefined,
        defaultSellingPrice: parseFloat(data.salePrice),
        defaultPurchasePrice: data.purchasePrice
          ? parseFloat(data.purchasePrice)
          : 0,
      };

      const { data: newProduct } = await productsApi.create(payload);
      console.log(newProduct);
      Toast.show({
        type: 'success',
        text1: 'Product Added',
        text2: `${newProduct.name} has been added successfully`,
      });
      if (fromFlow) {
        navigation.goBack();
      } else {
        // Navigate to product detail
        navigation.replace('ProductDetail', { productId: newProduct.id });
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
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
                title={isSubmitting ? 'Saving...' : '+ Add Product'}
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
