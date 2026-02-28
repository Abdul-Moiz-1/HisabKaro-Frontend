// flows/receipt/screens/AmountEntryScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoIcon } from 'phosphor-react-native';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import {
  setAmount,
  setPaymentDate,
  selectReceiptCustomer,
  selectReceiptAmount,
  selectRemainingAfterPayment,
  selectReceiptPaymentDate,
} from '../../../../store/slices/receiptsSlice';
import ActionButton from '../../../../components/common/ActionButton';
import { AmountInputField, DateField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';

const AmountEntryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectReceiptCustomer);
  const storedAmount = useAppSelector(selectReceiptAmount);
  const remainingAfterPayment = useAppSelector(selectRemainingAfterPayment);
  const storedPaymentDate = useAppSelector(selectReceiptPaymentDate);

  const [localAmount, setLocalAmount] = useState<number>(storedAmount || 0);
  const [date, setDate] = useState(new Date(storedPaymentDate || new Date().toISOString()));

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Calculate remaining - use totalOutstanding or outstanding_balance
  const outstanding = customer?.totalOutstanding || customer?.outstanding_balance || 0;
  const remaining = outstanding - localAmount;

  // Quick amount options
  const quickAmounts = useMemo(() => {
    const amounts: { label: string; value: number }[] = [];

    if (outstanding > 0) {
      amounts.push({
        label: `Full ${outstanding.toLocaleString()}`,
        value: outstanding,
      });
    }

    if (outstanding >= 2) {
      const half = Math.floor(outstanding / 2);
      amounts.push({
        label: `Half ${half.toLocaleString()}`,
        value: half,
      });
    }

    if (outstanding >= 25000) {
      amounts.push({ label: '25k', value: 25000 });
    }

    if (outstanding >= 10000) {
      amounts.push({ label: '10k', value: 10000 });
    }

    if (outstanding >= 5000) {
      amounts.push({ label: '5k', value: 5000 });
    }

    return amounts;
  }, [outstanding]);

  const handleAmountChange = useCallback((value: string) => {
    const numeric = Number(value.replace(/,/g, ''));
    setLocalAmount(isNaN(numeric) ? 0 : numeric);
  }, []);

  const handleQuickAmount = useCallback((value: number) => {
    setLocalAmount(value);
  }, []);

  const handleContinue = useCallback(() => {
    dispatch(setAmount(localAmount));
    dispatch(setPaymentDate(date.toISOString()));
    // @ts-ignore
    navigation.navigate('PaymentMethod');
  }, [dispatch, localAmount, date, navigation]);

  // Determine remaining text color
  const getRemainingColor = useCallback(() => {
    if (remaining === 0) return theme.colors.success;
    if (remaining < 0) return theme.colors.warning;
    return theme.colors.primary;
  }, [remaining, theme]);

  // Is this an advance payment?
  const isAdvance = localAmount > outstanding;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{customer?.name} owes you:</Text>
          <Text style={styles.infoAmount}>
            PKR {outstanding.toLocaleString()}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>How much did {customer?.name} pay?</Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: 'Amount',
            type: FieldType.AMOUNT,
            required: true,
          }}
          value={localAmount.toString()}
          onChange={handleAmountChange}
          onBlur={() => {}}
        />

        {/* Quick Amounts */}
        {quickAmounts.length > 0 && (
          <View style={styles.quickAmountsContainer}>
            <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickAmountButton,
                    localAmount === quickAmount.value &&
                      styles.quickAmountSelected,
                  ]}
                  onPress={() => handleQuickAmount(quickAmount.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      localAmount === quickAmount.value &&
                        styles.quickAmountTextSelected,
                    ]}
                  >
                    {quickAmount.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Remaining Display */}
        <View style={styles.remainingCard}>
          <Text style={styles.remainingLabel}>
            {isAdvance ? 'Advance amount:' : 'Remaining after payment:'}
          </Text>
          <Text
            style={[styles.remainingAmount, { color: getRemainingColor() }]}
          >
            PKR {Math.abs(remaining).toLocaleString()}
          </Text>
        </View>

        {/* Warning for advance payment */}
        {isAdvance && (
          <View style={styles.warningCard}>
            <InfoIcon size={18} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              Amount exceeds outstanding balance. PKR{' '}
              {Math.abs(remaining).toLocaleString()} will be recorded as advance
              payment.
            </Text>
          </View>
        )}

        {/* Full payment badge */}
        {remaining === 0 && localAmount > 0 && (
          <View style={styles.successCard}>
            <Text style={styles.successText}>
              Full payment - Account will be cleared
            </Text>
          </View>
        )}

        {/* Date Section */}
        <Text style={styles.sectionTitle}>When did {customer?.name} pay?</Text>
        <View style={styles.quickDates}>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date())}
          >
            <Text style={styles.quickDateText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date(Date.now() - 24 * 60 * 60 * 1000))}
          >
            <Text style={styles.quickDateText}>Yesterday</Text>
          </TouchableOpacity>
        </View>

        <DateField
          field={{
            id: 'paymentDate',
            name: 'paymentDate',
            label: '',
            type: FieldType.DATE,
          }}
          value={date.toISOString()}
          onChange={(value: string) => setDate(new Date(value))}
          onBlur={() => {}}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={localAmount === 0}
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
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    infoAmount: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    quickAmountsContainer: {
      marginTop: theme.spacing.md,
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
    },
    quickAmountSelected: {
      backgroundColor: `${theme.colors.primary}15`,
      borderColor: theme.colors.primary,
    },
    quickAmountText: {
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    quickAmountTextSelected: {
      color: theme.colors.primary,
    },
    remainingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    remainingLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    remainingAmount: {
      fontSize: 20,
      fontWeight: '700',
    },
    warningCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.warning,
      lineHeight: 18,
    },
    successCard: {
      backgroundColor: `${theme.colors.success}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      alignItems: 'center',
    },
    successText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.success,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    quickDates: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    quickDateButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
    },
    quickDateText: {
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '600' as const,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });

export default AmountEntryScreen;
