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
  suppliersApi,
  UpdateSupplierPayload,
  Supplier,
} from '../../services/api';
import {
  editSupplierSchema,
  EditSupplierFormData,
} from './schemas/supplierSchemas';
import {
  TextInputField,
  PhoneInputField,
  EmailInputField,
  NumberInputField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';
import { formatCurrency } from '../../utils';

interface EditSupplierScreenProps extends NavigationProps<'EditSupplier'> {
  route: {
    params: {
      supplierId: string;
    };
  };
}

const EditSupplierScreen: React.FC<EditSupplierScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { supplierId } = route.params;

  // Loading state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supplier data
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<EditSupplierFormData>({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      creditPeriodDays: '',
    },
    mode: 'onChange',
  });

  console.log(errors);
  console.log(isDirty);
  console.log(isValid);

  // Fetch supplier data on mount
  useEffect(() => {
    fetchSupplierData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const { data: supplierData } = await suppliersApi.getById(supplierId);
      setSupplier(supplierData);
      console.log(supplierData);
      // Populate form fields using reset
      reset({
        name: supplierData.name,
        phoneNumber: supplierData.phoneNumber || '',
        email: supplierData.email || '',
        creditPeriodDays: supplierData.creditPeriodDays || '',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load supplier data',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle save supplier with React Hook Form
  const onSubmit = async (data: EditSupplierFormData) => {
    try {
      setIsSubmitting(true);

      const payload: UpdateSupplierPayload = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        email: data.email?.trim() || undefined,
        creditPeriodDays: data.creditPeriodDays || undefined,
      };

      const updatedSupplier = await suppliersApi.update(supplierId, payload);

      Toast.show({
        type: 'success',
        text1: 'Supplier Updated',
        text2: `${updatedSupplier.name} has been updated successfully`,
      });

      // Navigate back to supplier detail
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update supplier',
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
          <Text style={styles.loadingText}>Loading supplier data...</Text>
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
              <Text style={styles.sectionIcon}>🚚</Text>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  field={{
                    id: 'supplierName',
                    name: 'supplierName',
                    label: 'Supplier Name',
                    type: FieldType.TEXT,
                    placeholder: 'Enter supplier name',
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
                    placeholder: 'supplier@example.com',
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
                    hint: 'Number of days to make payment to supplier (0-365)',
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
                <Text style={styles.readOnlyLabel}>Payable Balance</Text>
                <Text style={styles.readOnlyValue}>
                  {formatCurrency(supplier?.outstandingBalance)}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Total Purchases</Text>
                <Text style={styles.readOnlyValue}>
                  {formatCurrency(supplier?.totalPurchases)}
                </Text>
              </View>

              <View style={styles.readOnlyDivider} />

              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Total Payments</Text>
                <Text style={styles.readOnlyValue}>
                  {formatCurrency(supplier?.totalPayments)}
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
                title={isSubmitting ? 'Updating...' : '✓ Update Supplier'}
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

export default EditSupplierScreen;
