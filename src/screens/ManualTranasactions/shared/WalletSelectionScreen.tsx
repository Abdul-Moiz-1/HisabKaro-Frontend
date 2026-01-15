// shared/WalletSelectionScreen.tsx
// Reusable wallet selection screen for both Sales and Receipt flows
import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useAppDispatch } from '../../../store/hooks';
import { setPaymentMethod } from '../../../store/slices/salesSlice';
import {
  DateField,
  RadioField,
  TextInputField,
} from '../../../components/DynamicForm';
import ActionButton from '../../../components/common/ActionButton';
import { FieldType } from '../../../types/forms';

// Wallet selection schema
const walletSelectionSchema = z.object({
  walletType: z.enum(['jazzcash', 'easypaisa', 'nayapay', 'sadapay', 'other'], {
    required_error: 'Please select a wallet type',
  }),
  customWalletName: z.string().optional(),
  walletAccount: z
    .string()
    .min(1, 'Wallet account is required')
    .max(50, 'Account is too long'),
  walletDate: z.string().min(1, 'Payment date is required'),
}).superRefine((data, ctx) => {
  // If "other" is selected, custom wallet name is required
  if (data.walletType === 'other' && !data.customWalletName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter wallet name',
      path: ['customWalletName'],
    });
  }
});

type WalletSelectionFormValues = z.infer<typeof walletSelectionSchema>;

type RouteParams = {
  WalletSelection: {
    flowType: 'sales' | 'receipt';
    nextScreen?: string;
  };
};

const walletOptions = [
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Easypaisa', value: 'easypaisa' },
  { label: 'NayaPay', value: 'nayapay' },
  { label: 'SadaPay', value: 'sadapay' },
  { label: 'Other', value: 'other' },
];

const WalletSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'WalletSelection'>>();
  const dispatch = useAppDispatch();

  const { flowType = 'sales', nextScreen = 'Confirmation' } = route.params || {};

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<WalletSelectionFormValues>({
    resolver: zodResolver(walletSelectionSchema),
    mode: 'onChange',
    defaultValues: {
      walletAccount: '',
      walletDate: new Date().toISOString().split('T')[0],
      customWalletName: '',
    },
  });

  const walletType = watch('walletType');

  const handleContinue = useCallback(
    (data: WalletSelectionFormValues) => {
      const walletDetails = {
        walletType: data.walletType === 'other' ? data.customWalletName : data.walletType,
        walletAccount: data.walletAccount,
        walletDate: data.walletDate,
      };

      // Update Redux based on flow type
      if (flowType === 'sales') {
        dispatch(setPaymentMethod('wallet'));
      }

      // Navigate to next screen with wallet details
      // @ts-ignore
      navigation.navigate(nextScreen, {
        flowType,
        walletDetails,
        paymentMethod: 'wallet',
      });
    },
    [flowType, dispatch, navigation, nextScreen]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Which wallet received payment?</Text>

          <Controller
            control={control}
            name="walletType"
            render={({ field: { onChange, value } }) => (
              <RadioField
                field={{
                  id: 'walletType',
                  name: 'walletType',
                  label: '',
                  type: FieldType.RADIO,
                  required: true,
                  options: walletOptions,
                }}
                value={value}
                onChange={onChange}
                error={errors.walletType?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>

        {/* Custom Wallet Name (if Other selected) */}
        {walletType === 'other' && (
          <View style={styles.section}>
            <Controller
              control={control}
              name="customWalletName"
              render={({ field: { onChange, value } }) => (
                <TextInputField
                  field={{
                    id: 'customWalletName',
                    name: 'customWalletName',
                    label: 'Wallet Name',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'Enter wallet name',
                  }}
                  value={value || ''}
                  onChange={onChange}
                  error={errors.customWalletName?.message}
                  onBlur={() => {}}
                />
              )}
            />
          </View>
        )}

        {/* Wallet Account */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="walletAccount"
            render={({ field: { onChange, value } }) => (
              <TextInputField
                field={{
                  id: 'walletAccount',
                  name: 'walletAccount',
                  label: 'Wallet Account Number/Phone',
                  type: FieldType.TEXT,
                  required: true,
                  placeholder: 'Enter wallet account or phone',
                }}
                value={value}
                onChange={onChange}
                error={errors.walletAccount?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When did you receive the payment?</Text>

          <Controller
            control={control}
            name="walletDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                field={{
                  id: 'walletDate',
                  name: 'walletDate',
                  label: 'Payment Date',
                  type: FieldType.DATE,
                  required: true,
                }}
                value={value}
                onChange={onChange}
                error={errors.walletDate?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default WalletSelectionScreen;
