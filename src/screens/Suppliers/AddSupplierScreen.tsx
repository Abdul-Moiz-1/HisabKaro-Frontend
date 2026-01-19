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
import { suppliersApi, CreateSupplierPayload } from '../../services/api';
import {
  addSupplierSchema,
  AddSupplierFormData,
} from './schemas/supplierSchemas';
import {
  TextInputField,
  PhoneInputField,
  EmailInputField,
  AmountInputField,
  NumberInputField,
} from '../../components/DynamicForm';
import ActionButton from '../../components/common/ActionButton';
import { FieldType } from '../../types/forms';

const AddSupplierScreen: React.FC<NavigationProps<'AddSupplier'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AddSupplierFormData>({
    resolver: zodResolver(addSupplierSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      openingBalance: '0',
      creditPeriodDays: '',
    },
  });

  const handleSaveSupplier = async (data: AddSupplierFormData) => {
    try {
      setIsSubmitting(true);

      const payload: CreateSupplierPayload = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber,
        email: data.email?.trim() || undefined,
        openingBalance: data.openingBalance
          ? parseFloat(data.openingBalance)
          : undefined,
        creditPeriodDays: data.creditPeriodDays
          ? parseInt(data.creditPeriodDays)
          : undefined,
      };

      const { data: newSupplier } = await suppliersApi.create(payload);

      Toast.show({
        type: 'success',
        text1: 'Supplier Added',
        text2: `${newSupplier.name} has been added successfully`,
      });

      // Navigate to supplier detail
      navigation.replace('SupplierDetail', { supplierId: newSupplier.id });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create supplier',
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
              name="openingBalance"
              render={({ field: { onChange, onBlur, value } }) => (
                <AmountInputField
                  field={{
                    id: 'openingBalance',
                    name: 'openingBalance',
                    label: 'Opening Balance (Payable)',
                    type: FieldType.AMOUNT,
                    placeholder: '0',
                    suffix: 'PKR',
                    hint: 'Any existing balance payable to this supplier',
                  }}
                  value={value?.toString() || '0'}
                  onChange={text => onChange(text)}
                  onBlur={onBlur}
                  error={errors.openingBalance?.message}
                />
              )}
            />

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
                title={isSubmitting ? 'Saving...' : '✓ Save Supplier'}
                onPress={handleSubmit(handleSaveSupplier)}
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

export default AddSupplierScreen;
