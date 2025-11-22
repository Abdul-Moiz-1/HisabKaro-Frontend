// flows/purchase/screens/AddSupplierScreen.tsx
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
  EmailInputField,
  PhoneInputField,
  TextAreaField,
  TextInputField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FieldType } from '../../../../types/forms';

interface Supplier {
  name: string;
  phone: string;
  email: string;
  address: string;
  openingBalance: string;
  creditPeriod: string;
  creditLimit: string;
  businessType: string;
}

type SupplierFieldType = keyof Supplier;

const AddSupplierScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen, goBack } = useFlowNavigation();

  const [formData, setFormData] = useState<Supplier>({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: '0',
    creditPeriod: '30',
    creditLimit: '',
    businessType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Supplier name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;

      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^3[0-9]{9}$/.test(value))
          error = 'Invalid phone number format';
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'openingBalance':
        if (parseFloat(value) < 0) error = 'Opening balance cannot be negative';
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

  const handleFieldBlur = (field: SupplierFieldType) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const validateFields: SupplierFieldType[] = ['name', 'phone'];
    validateFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      address: true,
      openingBalance: true,
      creditPeriod: true,
      creditLimit: true,
      businessType: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newSupplier = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        outstanding: parseFloat(formData.openingBalance),
        creditPeriod: parseInt(formData.creditPeriod),
        creditLimit: formData.creditLimit
          ? parseFloat(formData.creditLimit)
          : undefined,
        businessType: formData.businessType,
      };

      navigateToScreen('SupplierSelection', { newSupplier });
    }
  };

  const creditPeriodOptions = [
    { label: 'Cash (0 days)', value: '0' },
    { label: '7 days', value: '7' },
    { label: '15 days', value: '15' },
    { label: '30 days', value: '30' },
    { label: '45 days', value: '45' },
    { label: '60 days', value: '60' },
    { label: '90 days', value: '90' },
  ];

  const businessTypeOptions = [
    { label: 'Wholesaler', value: 'wholesaler' },
    { label: 'Manufacturer', value: 'manufacturer' },
    { label: 'Distributor', value: 'distributor' },
    { label: 'Retailer', value: 'retailer' },
    { label: 'Importer', value: 'importer' },
    { label: 'Other', value: 'other' },
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
              <Text style={styles.sectionIcon}>🏪</Text>
              <Text style={styles.sectionTitle}>Supplier Information</Text>
            </View>

            <TextInputField
              field={{
                id: 'supplierName',
                name: 'supplierName',
                label: 'Supplier Name',
                required: true,
                placeholder: 'Enter supplier name',
                type: FieldType.TEXT,
              }}
              value={formData.name}
              onChange={(value: string) => handleFieldChange('name', value)}
              onBlur={() => handleFieldBlur('name')}
              error={touched.name ? errors.name : undefined}
            />

            <PhoneInputField
              field={{
                id: 'phoneNumber',
                name: 'phoneNumber',
                label: 'Phone Number',
                required: true,
                placeholder: '3001234567',
                type: FieldType.PHONE,
              }}
              value={formData.phone}
              onChange={value => handleFieldChange('phone', value)}
              onBlur={() => handleFieldBlur('phone')}
              error={touched.phone ? errors.phone : undefined}
            />

            <EmailInputField
              field={{
                id: 'email',
                name: 'email',
                label: 'Email',
                placeholder: 'supplier@example.com',
                type: FieldType.EMAIL,
              }}
              value={formData.email}
              onChange={value => handleFieldChange('email', value)}
              onBlur={() => handleFieldBlur('email')}
              error={touched.email ? errors.email : undefined}
            />

            <TextAreaField
              field={{
                id: 'address',
                name: 'address',
                label: 'Address',
                placeholder: 'Enter supplier address',
                numberOfLines: 3,

                type: FieldType.TEXTAREA,
              }}
              value={formData.address}
              onChange={value => handleFieldChange('address', value)}
              onBlur={() => handleFieldBlur('address')}
              error={touched.address ? errors.address : undefined}
            />

            <DropdownField
              field={{
                id: 'businessType',
                name: 'businessType',
                label: 'Business Type',
                placeholder: 'Select business type',
                options: businessTypeOptions,

                type: FieldType.DROPDOWN,
              }}
              value={formData.businessType}
              onChange={value => handleFieldChange('businessType', value)}
              onBlur={() => handleFieldBlur('businessType')}
              error={touched.businessType ? errors.businessType : undefined}
            />
          </View>

          {/* Payment Terms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💳</Text>
              <Text style={styles.sectionTitle}>Payment Terms</Text>
            </View>

            <AmountInputField
              field={{
                id: 'openingBalance',
                name: 'openingBalance',
                label: 'Opening Balance (Payable)',
                placeholder: '0',
                suffix: 'PKR',
                options: businessTypeOptions,

                type: FieldType.AMOUNT,
              }}
              value={formData.openingBalance}
              onChange={value => handleFieldChange('openingBalance', value)}
              onBlur={() => handleFieldBlur('openingBalance')}
              error={touched.openingBalance ? errors.openingBalance : undefined}
            />

            <DropdownField
              field={{
                id: 'creditPeriod',
                name: 'creditPeriod',
                label: 'Credit Period',
                placeholder: 'Select credit period',
                options: creditPeriodOptions,

                type: FieldType.DROPDOWN,
              }}
              value={formData.creditPeriod}
              onChange={value => handleFieldChange('creditPeriod', value)}
              onBlur={() => handleFieldBlur('creditPeriod')}
              error={touched.creditPeriod ? errors.creditPeriod : undefined}
            />

            <AmountInputField
              field={{
                id: 'creditLimit',
                name: 'creditLimit',
                label: 'Credit Limit',
                placeholder: '0',
                suffix: 'PKR',
                hint: 'Maximum credit you can take from this supplier',
                type: FieldType.AMOUNT,
              }}
              value={formData.creditLimit}
              onChange={value => handleFieldChange('creditLimit', value)}
              onBlur={() => handleFieldBlur('creditLimit')}
              error={touched.creditLimit ? errors.creditLimit : undefined}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <ActionButton title="Cancel" onPress={goBack} variant="outline" />
            <View style={styles.footerSpacer} />
            <ActionButton
              title="✓ Save Supplier"
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

export default AddSupplierScreen;
