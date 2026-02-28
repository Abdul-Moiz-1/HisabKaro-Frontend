import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import {
  customersApi,
  UpdateCustomerPayload,
  Customer,
} from '../../services/api';
import {
  editCustomerSchema,
  EditCustomerFormData,
} from './schemas/customerSchemas';
import {
  TextInputField,
  PhoneInputField,
  EmailInputField,
  NumberInputField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';

interface EditCustomerScreenProps extends NavigationProps<'EditCustomer'> {
  route: {
    params: {
      customerId: string;
    };
  };
}

const EditCustomerScreen: React.FC<EditCustomerScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { customerId } = route.params;

  // Loading state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer data
  const [customer, setCustomer] = useState<Customer | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      creditPeriodDays: '',
    },
    mode: 'onChange',
  });

  // Fetch customer data on mount
  useEffect(() => {
    fetchCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const customerData = await customersApi.getById(customerId);
      console.log(customerData);
      setCustomer(customerData);

      // Populate form fields using reset
      reset({
        name: customerData.name,
        phoneNumber: customerData.phoneNumber || '',
        email: customerData.email || '',
        creditPeriodDays: customerData.creditPeriodDays?.toString() || '',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load customer data',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle save customer with React Hook Form
  const onSubmit = async (data: EditCustomerFormData) => {
    try {
      setIsSubmitting(true);

      const payload: UpdateCustomerPayload = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        email: data.email?.trim() || undefined,
        creditPeriodDays: data.creditPeriodDays
          ? parseInt(data.creditPeriodDays)
          : undefined,
      };

      const updatedCustomer = await customersApi.update(customerId, payload);

      Toast.show({
        type: 'success',
        text1: 'Customer Updated',
        text2: `${updatedCustomer.name} has been updated successfully`,
      });

      // Navigate back to customer detail
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update customer',
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
          <Text style={styles.loadingText}>Loading customer data...</Text>
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
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>ℹ️</Text>
            <Text style={styles.infoBannerText}>
              You can only edit name, phone number, email, and credit period.
              Other details cannot be changed.
            </Text>
          </View>

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
              name="phoneNumber"
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
                  error={errors.phoneNumber?.message}
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

          {/* Financial Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>Financial Information</Text>
            </View>

            <Controller
              control={control}
              name="creditPeriodDays"
              render={({ field: { onChange, onBlur, value } }) => (
                <NumberInputField
                  field={{
                    id: 'creditPeriodDays',
                    name: 'creditPeriodDays',
                    label: 'Credit Period (Days)',
                    type: FieldType.NUMBER,
                    placeholder: '30',
                    hint: 'Number of days customer has to make payment (0-365)',
                  }}
                  value={value?.toString() || ''}
                  onChange={text => onChange(text)}
                  onBlur={onBlur}
                  error={errors.creditPeriodDays?.message}
                />
              )}
            />
          </View>

          {/* Read-only Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📊</Text>
              <Text style={styles.sectionTitle}>Read-only Information</Text>
            </View>

            <View style={styles.readOnlyCard}>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Outstanding Balance</Text>
                <Text style={styles.readOnlyValue}>
                  PKR {customer?.totalOutstanding?.toLocaleString() || '0'}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Total Sales</Text>
                <Text style={styles.readOnlyValue}>
                  PKR {customer?.totalSales?.toLocaleString() || '0'}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Total Payments</Text>
                <Text style={styles.readOnlyValue}>
                  PKR {customer?.totalPayments?.toLocaleString() || '0'}
                </Text>
              </View>

              {customer?.address && (
                <>
                  <View style={styles.readOnlyDivider} />
                  <View style={styles.readOnlyItem}>
                    <Text style={styles.readOnlyLabel}>Address</Text>
                    <Text style={styles.readOnlyValue}>{customer.address}</Text>
                  </View>
                </>
              )}

              {customer?.city && (
                <>
                  <View style={styles.readOnlyDivider} />
                  <View style={styles.readOnlyItem}>
                    <Text style={styles.readOnlyLabel}>City</Text>
                    <Text style={styles.readOnlyValue}>{customer.city}</Text>
                  </View>
                </>
              )}
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
                title={isSubmitting ? 'Updating...' : '✓ Update Customer'}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                disabled={!isDirty || !isValid || isSubmitting}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.info}15`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.info,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    infoBannerIcon: {
      fontSize: 18,
      marginRight: theme.spacing.sm,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text.secondary,
      lineHeight: 18,
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
    readOnlyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    readOnlyDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
    readOnlyLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    readOnlyValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
      flex: 1,
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

export default EditCustomerScreen;
