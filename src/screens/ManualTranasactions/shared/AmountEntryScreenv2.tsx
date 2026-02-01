import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CurrencyCircleDollarIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';

import { useTheme } from '../../../store/hooks';
import { Input } from '../../../components/forms';
import { Button } from '../../../components/common';
import { AmountInputField } from '../../../components/DynamicForm';
import { FieldType } from '../../../types/forms';

// Zod Schema
const amountEntrySchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .refine(val => val > 0, 'Please enter a valid amount'),
});

type AmountEntryFormValues = z.infer<typeof amountEntrySchema>;

type RouteParams = {
  AmountEntry: {
    flowType: 'receipt' | 'payment';
    customerName?: string;
    customerOutstanding?: number;
    customerId?: string;
    nextScreen?: string;
    onAmountSet?: (amount: number, remaining: number) => void;
  };
};

const AmountEntryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AmountEntry'>>();

  const {
    flowType = 'receipt',
    customerName = 'Customer',
    customerOutstanding = 0,
    nextScreen = 'PaymentMethod',
    onAmountSet,
  } = route.params || {};

  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AmountEntryFormValues>({
    resolver: zodResolver(amountEntrySchema),
    mode: 'onChange',
    defaultValues: {
      amount: 0,
    },
  });

  const amount = watch('amount');

  const remaining = useMemo(() => {
    if (flowType === 'receipt') {
      return customerOutstanding - amount;
    }
    return 0;
  }, [amount, customerOutstanding, flowType]);

  const quickAmounts = useMemo(() => {
    const amounts = [];

    if (flowType === 'receipt' && customerOutstanding > 0) {
      amounts.push({
        label: `Full ${customerOutstanding.toLocaleString()}`,
        value: customerOutstanding,
      });

      if (customerOutstanding > 1) {
        amounts.push({
          label: `Half ${Math.floor(customerOutstanding / 2).toLocaleString()}`,
          value: Math.floor(customerOutstanding / 2),
        });
      }

      if (customerOutstanding >= 25000) {
        amounts.push({ label: '25k', value: 25000 });
      }
      if (customerOutstanding >= 10000) {
        amounts.push({ label: '10k', value: 10000 });
      }
      if (customerOutstanding >= 5000) {
        amounts.push({ label: '5k', value: 5000 });
      }
    } else {
      // Default quick amounts
      amounts.push(
        { label: '1k', value: 1000 },
        { label: '5k', value: 5000 },
        { label: '10k', value: 10000 },
        { label: '25k', value: 25000 },
      );
    }

    return amounts;
  }, [flowType, customerOutstanding]);

  const handleContinue = useCallback(
    (data: AmountEntryFormValues) => {
      if (onAmountSet) {
        onAmountSet(data.amount, remaining);
      }

      // @ts-ignore
      navigation.navigate(nextScreen, {
        amount: data.amount,
        remaining,
      });
    },
    [navigation, nextScreen, remaining, onAmountSet],
  );

  const getRemainingColor = () => {
    if (remaining === 0) return theme.colors.success;
    if (remaining < 0) return theme.colors.warning;
    return theme.colors.primary;
  };

  const formatAmount = (value: number): string => {
    return value.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <CurrencyCircleDollarIcon
              size={32}
              color={theme.colors.primary}
              weight="fill"
            />
          </View>
          <Text style={styles.headerTitle}>
            {flowType === 'receipt' ? 'Receipt Amount' : 'Payment Amount'}
          </Text>
        </View>

        {/* Customer Info Card */}
        {flowType === 'receipt' && customerOutstanding > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{customerName} owes you:</Text>
            <Text style={styles.infoAmount}>
              PKR {formatAmount(customerOutstanding)}
            </Text>
          </View>
        )}

        {/* Question */}
        <Text style={styles.question}>
          {flowType === 'receipt'
            ? `How much did ${customerName} pay?`
            : 'Enter payment amount:'}
        </Text>

        {/* Amount Input */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>PKR</Text>
                <AmountInputField
                  field={{
                    id: 'amount',
                    name: 'amount',
                    label: 'Amount',
                    type: FieldType.AMOUNT,
                    required: true,
                  }}
                  value={value?.toString() || ''}
                  onChange={onChange}
                  onBlur={() => {}}
                />
              </View>
            </View>
          )}
        />

        {/* Quick Amounts */}
        <View style={styles.quickAmountsContainer}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map(quickAmount => (
              <TouchableOpacity
                key={quickAmount.label}
                style={styles.quickAmountButton}
                onPress={() =>
                  setValue('amount', quickAmount.value, {
                    shouldValidate: true,
                  })
                }
              >
                <Text style={styles.quickAmountText}>{quickAmount.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Remaining Display (for receipts) */}
        {flowType === 'receipt' && (
          <View style={styles.remainingCard}>
            <Text style={styles.remainingLabel}>Remaining:</Text>
            <Text
              style={[styles.remainingAmount, { color: getRemainingColor() }]}
            >
              PKR {formatAmount(remaining)}
            </Text>
          </View>
        )}

        {/* Warning for overpayment */}
        {flowType === 'receipt' &&
          customerOutstanding > 0 &&
          amount > customerOutstanding * 1.1 && (
            <View style={styles.warningCard}>
              <WarningCircleIcon
                size={20}
                color={theme.colors.warning}
                weight="fill"
              />
              <Text style={styles.warningText}>
                Amount exceeds outstanding. Excess will be recorded as advance.
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid || amount === 0}
          variant="primary"
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
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    infoLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    infoAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    question: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    amountInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      ...theme.shadows.sm,
    },
    currencySymbol: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
    },
    amountInput: {
      flex: 1,
      fontSize: 24,
      fontWeight: '600',
      padding: theme.spacing.md,
    },
    quickAmountsContainer: {
      marginBottom: theme.spacing.lg,
    },
    quickAmountsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    quickAmounts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    quickAmountButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.xs,
    },
    quickAmountText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    remainingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    remainingLabel: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    remainingAmount: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.warning,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });

export default AmountEntryScreen;
