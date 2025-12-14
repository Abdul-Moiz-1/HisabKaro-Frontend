// flows/sales/screens/AddProductScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import {
  AmountInputField,
  DropdownField,
  NumberInputField,
  TextInputField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FieldType } from '../../../../types/forms';
interface Product {
  name: string;
  category: string;
  sku: string;
  salePrice: string;
  purchasePrice: string;
  unit: string;
  stockQuantity: string;
  lowStockAlert: string;
}
type ProductKey = keyof Product;

const AddProductScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen, goBack } = useFlowNavigation();

  const [formData, setFormData] = useState<Product>({
    name: '',
    category: '',
    sku: '',
    salePrice: '',
    purchasePrice: '',
    unit: 'piece',
    stockQuantity: '',
    lowStockAlert: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Product name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;

      case 'salePrice':
        if (!value.trim()) error = 'Sale price is required';
        else if (parseFloat(value) <= 0)
          error = 'Sale price must be greater than 0';
        break;

      case 'stockQuantity':
        if (!value.trim()) error = 'Stock quantity is required';
        else if (parseInt(value) < 0)
          error = 'Stock quantity cannot be negative';
        break;
    }

    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: ProductKey) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const validateFields: ProductKey[] = ['name', 'salePrice', 'stockQuantity'];
    validateFields.forEach((field: ProductKey) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      category: true,
      sku: true,
      salePrice: true,
      purchasePrice: true,
      unit: true,
      stockQuantity: true,
      lowStockAlert: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newProduct = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        salePrice: parseFloat(formData.salePrice),
        purchasePrice: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : 0,
        unit: formData.unit,
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockAlert: parseInt(formData.lowStockAlert),
      };

      navigateToScreen('ProductSelection', { newProduct });
    }
  };

  const categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Food & Beverages', value: 'food' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Stationery', value: 'stationery' },
    { label: 'Other', value: 'other' },
  ];

  const unitOptions = [
    { label: 'Piece', value: 'piece' },
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Liter (L)', value: 'liter' },
    { label: 'Meter (m)', value: 'meter' },
    { label: 'Box', value: 'box' },
    { label: 'Carton', value: 'carton' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📦</Text>
              <Text style={styles.sectionTitle}>Product Information</Text>
            </View>
            <TextInputField
              field={{
                id: 'name',
                name: 'name',
                label: 'Product Name',
                type: FieldType.TEXT,
                placeholder: 'Enter product name',
                required: true,
              }}
              value={formData.name}
              onChange={value => handleFieldChange('name', value)}
              onBlur={() => handleFieldBlur('name')}
              error={touched.name ? errors.name : undefined}
            />

            <DropdownField
              field={{
                id: 'category',
                name: 'category',
                label: 'Category',
                type: FieldType.DROPDOWN,
                placeholder: 'Select category',
                options: categoryOptions,
              }}
              value={formData.category}
              onChange={value => handleFieldChange('category', value)}
              onBlur={() => handleFieldBlur('category')}
              error={touched.category ? errors.category : undefined}
            />

            <TextInputField
              field={{
                id: 'sku',
                name: 'sku',
                label: 'SKU / Product Code',
                type: FieldType.TEXT,
                placeholder: 'Enter SKU (optional)',
              }}
              value={formData.sku}
              onChange={value => handleFieldChange('sku', value)}
              onBlur={() => handleFieldBlur('sku')}
              error={touched.sku ? errors.sku : undefined}
            />
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>Pricing</Text>
            </View>

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
              value={formData.salePrice}
              onChange={value => handleFieldChange('salePrice', value)}
              onBlur={() => handleFieldBlur('salePrice')}
              error={touched.salePrice ? errors.salePrice : undefined}
            />

            <AmountInputField
              field={{
                id: 'purchasePrice',
                name: 'purchasePrice',
                label: 'Purchase Price',
                type: FieldType.AMOUNT,
                placeholder: '0',
                suffix: 'PKR',
                hint: 'Cost price for profit calculation',
              }}
              value={formData.purchasePrice}
              onChange={value => handleFieldChange('purchasePrice', value)}
              onBlur={() => handleFieldBlur('purchasePrice')}
            />
          </View>

          {/* Inventory */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📊</Text>
              <Text style={styles.sectionTitle}>Inventory</Text>
            </View>

            <DropdownField
              field={{
                id: 'unit',
                name: 'unit',
                label: 'Unit',
                type: FieldType.DROPDOWN,
                required: true,
                options: unitOptions,
              }}
              value={formData.unit}
              onChange={value => handleFieldChange('unit', value)}
              onBlur={() => handleFieldBlur('unit')}
            />

            <NumberInputField
              field={{
                id: 'stockQuantity',
                name: 'stockQuantity',
                label: 'Stock Quantity',
                type: FieldType.NUMBER,
                placeholder: '0',
                required: true,
              }}
              value={formData.stockQuantity}
              onChange={value => handleFieldChange('stockQuantity', value)}
              onBlur={() => handleFieldBlur('stockQuantity')}
              error={touched.stockQuantity ? errors.stockQuantity : undefined}
            />

            <NumberInputField
              field={{
                id: 'lowStockAlert',
                name: 'lowStockAlert',
                label: 'Low Stock Alert',
                type: FieldType.NUMBER,
                placeholder: '10',
                hint: 'Get notified when stock falls below this level',
              }}
              value={formData.lowStockAlert}
              onChange={value => handleFieldChange('lowStockAlert', value)}
              onBlur={() => handleFieldBlur('lowStockAlert')}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <ActionButton title="Cancel" onPress={goBack} variant="outline" />
            <View style={styles.footerSpacer} />
            <ActionButton
              title="✓ Save Product"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default AddProductScreen;
