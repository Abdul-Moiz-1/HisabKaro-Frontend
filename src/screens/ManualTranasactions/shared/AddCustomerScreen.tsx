// shared/AddCustomerScreen.tsx
// Reusable Add Customer screen for both Sales and Receipt flows
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
  customersApi,
  CreateCustomerPayload,
} from '../../../services/api/customers';
import {
  TextInputField,
  PhoneInputField,
  EmailInputField,
  AmountInputField,
  DropdownField,
} from '../../../components/DynamicForm';
import ActionButton from '../../../components/common/ActionButton';
import { FieldType } from '../../../types/forms';

// Customer creation schema
const customerSchema = z.object({
  name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name is too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  city: z.string().max(50, 'City name is too long').optional(),
  opening_balance: z
    .number()
    .min(0, 'Opening balance cannot be negative')
    .optional(),
  credit_period_days: z
    .number()
    .min(0, 'Credit period cannot be negative')
    .optional(),
  credit_limit: z.number().min(0, 'Credit limit cannot be negative').optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type RouteParams = {
  AddCustomer: {
    flowType?: 'sales' | 'receipt' | 'standalone';
    nextScreen?: string;
  };
};

const AddCustomerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AddCustomer'>>();

  const { flowType = 'standalone', nextScreen = 'CustomerSelection' } =
    route.params || {};

  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: '',
      opening_balance: 0,
      credit_period_days: 30,
      credit_limit: 0,
    },
  });

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSaveCustomer = useCallback(
    async (data: CustomerFormValues) => {
      try {
        setIsSubmitting(true);

        // Prepare API payload
        const payload: CreateCustomerPayload = {
          name: data.name.trim(),
          phoneNumber: data.phone.trim(),
          email: data.email?.trim() || undefined,
          city: data.city?.trim() || undefined,
          openingBalance: data.opening_balance || 0,
          creditPeriodDays: data.credit_period_days || 0,
        };

        // Call API to create customer
        const newCustomer = await customersApi.create(payload);

        Toast.show({
          type: 'success',
          text1: 'Customer Added',
          text2: `${newCustomer.name} has been added successfully`,
        });

        // Navigate back with the new customer
        if (flowType === 'standalone') {
          navigation.goBack();
        } else {
          // @ts-ignore
          navigation.navigate(nextScreen, { newCustomer });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to create customer',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [flowType, navigation, nextScreen],
  );

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
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'customerName',
                    name: 'customerName',
                    label: 'Customer Name',
                    type: FieldType.TEXT,
                    placeholder: 'Enter customer name',
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
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <PhoneInputField
                  field={{
                    id: 'phoneNumber',
                    name: 'phoneNumber',
                    label: 'Phone Number',
                    type: FieldType.PHONE,
                    placeholder: '3001234567',
                    prefix: '+92',
                    required: true,
                  }}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <EmailInputField
                  field={{
                    id: 'email',
                    name: 'email',
                    label: 'Email',
                    type: FieldType.EMAIL,
                    placeholder: 'customer@example.com',
                  }}
                  value={value || ''}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          {/* Credit Terms Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💳</Text>
              <Text style={styles.sectionTitle}>Credit Terms</Text>
            </View>

            <Controller
              control={control}
              name="opening_balance"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'balance',
                    name: 'balance',
                    label: 'Opening Balance',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    hint: 'Any existing balance owed by this customer',
                  }}
                  value={value?.toString() || '0'}
                  onChange={text => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.opening_balance?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="credit_period_days"
              render={({ field: { onChange, onBlur, value } }) => (
                <DropdownField
                  field={{
                    id: 'credit',
                    name: 'credit',
                    label: 'Credit Period',
                    type: FieldType.DROPDOWN,
                    placeholder: 'Select credit period',
                    options: creditPeriodOptions,
                  }}
                  value={value?.toString() || '30'}
                  onChange={val => onChange(parseInt(val) || 0)}
                  onBlur={onBlur}
                  error={errors.credit_period_days?.message}
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
                title={isSubmitting ? 'Saving...' : '✓ Save Customer'}
                onPress={handleSubmit(handleSaveCustomer)}
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

export default AddCustomerScreen;
