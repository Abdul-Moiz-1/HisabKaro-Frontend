// flows/receipt/screens/AddCustomerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import ActionButton from '../../../../components/common/ActionButton';

// Import your existing field components
import { TextInputField } from '../../../../components/DynamicForm/fields';
import { PhoneInputField } from '../../../../components/DynamicForm/fields';
import { EmailInputField } from '../../../../components/DynamicForm/fields';
import { TextAreaField } from '../../../../components/DynamicForm/fields';
import { AmountInputField } from '../../../../components/DynamicForm/fields';
import { DropdownField } from '../../../../components/DynamicForm/fields';
import { useThemedStyles } from '../../../../theme';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { CreateCustomerPayload, customersApi } from '../../../../services/api';

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  // address?: string;
  openingBalance?: string;
  creditPeriod?: string;
  creditLimit?: string;
}

const AddCustomerScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen, goBack } = useFlowNavigation();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [creditPeriod, setCreditPeriod] = useState('30');
  const [creditLimit, setCreditLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!phone || phone.length !== 10) {
      newErrors.phone = 'Invalid phone number format (03XXXXXXXXX)';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (parseFloat(openingBalance) < 0) {
      newErrors.openingBalance = 'Opening balance cannot be negative';
    }

    if (creditLimit && parseFloat(creditLimit) < 0) {
      newErrors.creditLimit = 'Credit limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      email: true,
      // address: true,
      openingBalance: true,
      creditPeriod: true,
      creditLimit: true,
    });

    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors in the form',
      });
      console.log('HERE');
      return;
    }

    try {
      setSaving(true);

      const payload: CreateCustomerPayload = {
        name: name.trim(),
        phoneNumber: phone.trim() || undefined,
        email: email.trim() || undefined,
        openingBalance: parseFloat(openingBalance) || 0,
        creditPeriodDays: parseFloat(creditPeriod) || 0,
      };

      const newCustomer = await customersApi.create(payload);
      console.log(newCustomer);
      Toast.show({
        type: 'success',
        text1: 'Customer Added',
        text2: `${newCustomer.name} has been added successfully`,
      });

      // Navigate to customer detail or go back
      // navigation.replace('CustomerDetail', { customerId: newCustomer.id });
      navigateToScreen('CustomerSelection', { newCustomer });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create customer',
      });
    } finally {
      setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <TextInputField
              field={{
                id: 'customerName',
                name: 'customerName',
                label: 'Customer Name',
                type: FieldType.TEXT,
                placeholder: 'Enter customer name',
                required: true,
              }}
              value={name}
              onChange={setName}
              error={touched.name ? errors.name : undefined}
              onBlur={() => setTouched({ ...touched, name: true })}
            />

            <PhoneInputField
              field={{
                id: 'phoneNumber',
                name: 'phoneNumber',
                label: 'Phone Number',
                type: FieldType.PHONE,
                placeholder: '3001234567e',
                prefix: '+92',
                required: true,
              }}
              value={phone}
              onChange={setPhone}
              error={touched.phone ? errors.phone : undefined}
              onBlur={() => setTouched({ ...touched, phone: true })}
            />

            <EmailInputField
              field={{
                id: 'email',
                name: 'email',
                label: 'Email',
                type: FieldType.EMAIL,
                placeholder: 'customer@example.com',
                required: true,
              }}
              value={email}
              onChange={setEmail}
              error={touched.email ? errors.email : undefined}
              onBlur={() => setTouched({ ...touched, email: true })}
            />

            {/* <TextAreaField
              field={{
                id: 'address',
                name: 'address',
                label: 'Address',
                type: FieldType.TEXTAREA,
                placeholder: 'Enter customer address',
                required: true,
                numberOfLines: 3,
              }}
              value={address}
              onChange={setAddress}
              error={touched.address ? errors.address : undefined}
              onBlur={() => setTouched({ ...touched, address: true })}
            /> */}
          </View>

          {/* Credit Terms Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💳</Text>
              <Text style={styles.sectionTitle}>Credit Terms</Text>
            </View>

            <AmountInputField
              field={{
                id: 'balance',
                name: 'balance',
                label: 'Opening Balance',
                type: FieldType.AMOUNT,
                placeholder: '0',
                required: true,
                suffix: 'PKR',
              }}
              value={openingBalance}
              onChange={setOpeningBalance}
              error={touched.openingBalance ? errors.openingBalance : undefined}
              onBlur={() => setTouched({ ...touched, openingBalance: true })}
            />

            <DropdownField
              field={{
                id: 'credit',
                name: 'credit',
                label: 'Credit Period',
                type: FieldType.DROPDOWN,
                placeholder: 'Select credit period',
                required: true,
                suffix: 'PKR',
                options: creditPeriodOptions,
              }}
              value={creditPeriod}
              onChange={setCreditPeriod}
              error={touched.creditPeriod ? errors.creditPeriod : undefined}
              onBlur={() => setTouched({ ...touched, creditPeriod: true })}
            />

            {/* <AmountInputField
              field={{
                id: 'creditLimit',
                name: 'creditLimit',
                label: 'Credit Limit',
                type: FieldType.AMOUNT,
                placeholder: '0',
                required: true,
                suffix: 'PKR',
                options: creditPeriodOptions,
                hint: 'Maximum credit allowed for this customer',
              }}
              value={creditLimit}
              onChange={setCreditLimit}
              error={touched.creditLimit ? errors.creditLimit : undefined}
              onBlur={() => setTouched({ ...touched, creditLimit: true })}
            /> */}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <ActionButton title="Cancel" onPress={goBack} variant="outline" />
            </View>
            <View style={styles.buttonHalf}>
              <ActionButton title="✓ Save Customer" onPress={handleSubmit} />
            </View>
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
  buttonRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default AddCustomerScreen;
