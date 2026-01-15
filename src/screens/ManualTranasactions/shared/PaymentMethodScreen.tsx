// shared/PaymentMethodScreen.tsx
// Reusable payment method selection screen for both Sales and Receipt flows
import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useAppDispatch } from '../../../store/hooks';
import { setPaymentMethod as setSalesPaymentMethod } from '../../../store/slices/salesSlice';
import SelectionCard from '../../../components/common/SelectionCard';
import ActionButton from '../../../components/common/ActionButton';

// Payment method schema
const paymentMethodSchema = z.object({
  paymentMethod: z.enum(['cash', 'bank', 'wallet', 'cheque', 'card'], {
    required_error: 'Please select a payment method',
  }),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

type RouteParams = {
  PaymentMethod: {
    flowType: 'sales' | 'receipt';
    customerName?: string;
    nextScreen?: string; // Optional override for next screen
  };
};

const paymentMethods = [
  {
    value: 'cash' as const,
    label: 'Cash',
    icon: '💵',
    description: 'Received in hand',
    nextScreen: 'Confirmation',
  },
  {
    value: 'bank' as const,
    label: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct to your account',
    nextScreen: 'BankSelection',
  },
  {
    value: 'wallet' as const,
    label: 'Mobile Wallet',
    icon: '📱',
    description: 'JazzCash, Easypaisa, etc.',
    nextScreen: 'WalletSelection',
  },
  {
    value: 'cheque' as const,
    label: 'Cheque',
    icon: '📝',
    description: 'Post-dated or cleared',
    nextScreen: 'ChequeDetails',
  },
  {
    value: 'card' as const,
    label: 'Card/POS',
    icon: '💳',
    description: 'Credit/Debit card payment',
    nextScreen: 'Confirmation',
  },
];

const PaymentMethodScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'PaymentMethod'>>();
  const dispatch = useAppDispatch();

  const { flowType = 'sales', customerName = 'Customer' } = route.params || {};

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    mode: 'onChange',
  });

  const selectedMethod = watch('paymentMethod');

  const handleContinue = useCallback(
    (data: PaymentMethodFormValues) => {
      const method = paymentMethods.find((m) => m.value === data.paymentMethod);
      if (!method) return;

      // Update Redux based on flow type
      if (flowType === 'sales') {
        dispatch(setSalesPaymentMethod(data.paymentMethod));
      }
      // For receipt flow, we'll create a receiptSlice later or use a shared slice

      // Navigate to next screen
      const nextScreen = route.params?.nextScreen || method.nextScreen;
      // @ts-ignore
      navigation.navigate(nextScreen);
    },
    [flowType, dispatch, navigation, route.params]
  );

  const questionText =
    flowType === 'receipt'
      ? `How did ${customerName} pay?`
      : 'How will the customer pay?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>{questionText}</Text>

        <Controller
          control={control}
          name="paymentMethod"
          render={({ field: { onChange, value } }) => (
            <>
              {paymentMethods.map((method) => (
                <SelectionCard
                  key={method.value}
                  icon={method.icon}
                  label={method.label}
                  description={method.description}
                  selected={value === method.value}
                  onPress={() => onChange(method.value)}
                />
              ))}
            </>
          )}
        />
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
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default PaymentMethodScreen;
