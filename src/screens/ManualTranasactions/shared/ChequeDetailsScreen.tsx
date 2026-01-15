// shared/ChequeDetailsScreen.tsx
// Reusable cheque details screen for both Sales and Receipt flows
import React, { useMemo, useCallback } from 'react';
import {
  View,
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

import { useTheme, useAppDispatch } from '../../../store/hooks';
import { setPaymentMethod } from '../../../store/slices/salesSlice';
import {
  DateField,
  DropdownField,
  FileUploadField,
  NumberInputField,
  RadioField,
} from '../../../components/DynamicForm';
import ActionButton from '../../../components/common/ActionButton';
import { FieldType } from '../../../types/forms';

// Cheque details schema
const chequeDetailsSchema = z.object({
  chequeNumber: z
    .string()
    .min(1, 'Cheque number is required')
    .max(20, 'Cheque number is too long'),
  chequeDate: z.string().min(1, 'Cheque date is required'),
  chequeBankName: z.string().min(1, 'Bank name is required'),
  chequeStatus: z.enum(['received', 'cleared'], {
    required_error: 'Please select cheque status',
  }),
  chequePhoto: z.any().optional(),
});

type ChequeDetailsFormValues = z.infer<typeof chequeDetailsSchema>;

type RouteParams = {
  ChequeDetails: {
    flowType: 'sales' | 'receipt';
    nextScreen?: string;
  };
};

const ChequeDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ChequeDetails'>>();
  const dispatch = useAppDispatch();

  const { flowType = 'sales', nextScreen = 'Confirmation' } = route.params || {};

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChequeDetailsFormValues>({
    resolver: zodResolver(chequeDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      chequeNumber: '',
      chequeDate: new Date().toISOString().split('T')[0],
      chequeBankName: '',
      chequeStatus: 'received',
    },
  });

  const handleContinue = useCallback(
    (data: ChequeDetailsFormValues) => {
      // Update Redux based on flow type
      if (flowType === 'sales') {
        dispatch(setPaymentMethod('cheque'));
      }

      // Navigate to next screen with cheque details
      // @ts-ignore
      navigation.navigate(nextScreen, {
        flowType,
        chequeDetails: data,
        paymentMethod: 'cheque',
      });
    },
    [flowType, dispatch, navigation, nextScreen]
  );

  const bankOptions = [
    { label: 'HBL', value: 'HBL' },
    { label: 'Meezan Bank', value: 'Meezan Bank' },
    { label: 'Bank Alfalah', value: 'Bank Alfalah' },
    { label: 'UBL', value: 'UBL' },
    { label: 'MCB', value: 'MCB' },
    { label: 'Allied Bank', value: 'Allied Bank' },
    { label: 'Faysal Bank', value: 'Faysal Bank' },
    { label: 'Other', value: 'Other' },
  ];

  const statusOptions = [
    { label: 'Received (not cleared)', value: 'received' },
    { label: 'Cleared', value: 'cleared' },
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
          <Controller
            control={control}
            name="chequeNumber"
            render={({ field: { onChange, value } }) => (
              <NumberInputField
                field={{
                  id: 'chequeNumber',
                  name: 'chequeNumber',
                  label: 'Cheque Number',
                  type: FieldType.NUMBER,
                  maxLength: 20,
                  required: true,
                  placeholder: 'Enter cheque number',
                }}
                value={value}
                onChange={onChange}
                error={errors.chequeNumber?.message}
                onBlur={() => {}}
              />
            )}
          />

          <Controller
            control={control}
            name="chequeDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                field={{
                  id: 'chequeDate',
                  name: 'chequeDate',
                  label: 'Cheque Date',
                  type: FieldType.DATE,
                  required: true,
                }}
                value={value}
                onChange={onChange}
                error={errors.chequeDate?.message}
                onBlur={() => {}}
              />
            )}
          />

          <Controller
            control={control}
            name="chequeBankName"
            render={({ field: { onChange, value } }) => (
              <DropdownField
                field={{
                  id: 'chequeBankName',
                  name: 'chequeBankName',
                  label: 'Bank Name',
                  type: FieldType.DROPDOWN,
                  placeholder: 'Select bank',
                  options: bankOptions,
                  required: true,
                }}
                value={value}
                onChange={onChange}
                error={errors.chequeBankName?.message}
                onBlur={() => {}}
              />
            )}
          />

          <Controller
            control={control}
            name="chequeStatus"
            render={({ field: { onChange, value } }) => (
              <RadioField
                field={{
                  id: 'chequeStatus',
                  name: 'chequeStatus',
                  label: 'Status',
                  type: FieldType.RADIO,
                  options: statusOptions,
                  required: true,
                }}
                value={value}
                onChange={onChange}
                error={errors.chequeStatus?.message}
                onBlur={() => {}}
              />
            )}
          />

          <Controller
            control={control}
            name="chequePhoto"
            render={({ field: { onChange, value } }) => (
              <FileUploadField
                field={{
                  id: 'chequePhoto',
                  name: 'chequePhoto',
                  label: 'Attach cheque photo (optional)',
                  type: FieldType.FILE,
                  placeholder: '📸 Attach cheque photo',
                  hint: 'Max size 5MB, formats: JPG, PNG',
                }}
                value={value}
                onChange={onChange}
                onBlur={() => {}}
              />
            )}
          />
        </ScrollView>

        <View style={styles.footer}>
          <ActionButton
            title="Continue →"
            onPress={handleSubmit(handleContinue)}
            disabled={!isValid}
            variant="primary"
          />
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
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default ChequeDetailsScreen;
