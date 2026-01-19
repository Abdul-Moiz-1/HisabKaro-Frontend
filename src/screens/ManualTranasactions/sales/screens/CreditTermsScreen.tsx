// flows/sales/screens/CreditTermsScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  MoneyIcon,
  CalendarIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from 'phosphor-react-native';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import {
  selectSelectedCustomer,
  selectIsWalkInSale,
  selectSaleTotals,
  setPaymentStatus,
  setPaymentMethod,
  setDueDate,
  setPaidAmount,
  setNotes,
  selectSalePaymentDetails,
} from '../../../../store/slices/salesSlice';
import { Button } from '../../../../components/common';

type PaymentType = 'full' | 'credit' | 'partial';

const CreditTermsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectSelectedCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);
  const totals = useAppSelector(selectSaleTotals);
  const paymentDetails = useAppSelector(selectSalePaymentDetails);

  const [paymentType, setLocalPaymentType] = useState<PaymentType | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  );
  const [partialAmount, setPartialAmount] = useState('');
  const [notes, setLocalNotes] = useState('');

  const styles = useMemo(() => createStyles(theme), [theme]);

  const customerName = isWalkIn
    ? 'Walk-in Customer'
    : customer?.name || 'Unknown';

  const handlePaymentTypeSelect = useCallback(
    (type: PaymentType) => {
      setLocalPaymentType(type);

      if (type === 'full') {
        dispatch(setPaymentStatus('paid'));
        dispatch(setPaymentMethod('Cash'));
        dispatch(setPaidAmount(totals.grandTotal));
        dispatch(setDueDate(null));
      } else if (type === 'credit') {
        dispatch(setPaymentStatus('pending'));
        dispatch(setPaymentMethod('Credit'));
        dispatch(setPaidAmount(0));
      } else if (type === 'partial') {
        // Will be set when amount is entered
        dispatch(setPaymentMethod('Cash'));
      }
    },
    [dispatch, totals.grandTotal],
  );

  const handlePartialAmountChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      setPartialAmount(cleaned);

      if (cleaned) {
        const amount = Number(cleaned);
        dispatch(setPaidAmount(amount));
      }
    },
    [dispatch],
  );

  const handleDateChange = useCallback(
    (event: any, date?: Date) => {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        dispatch(setDueDate(date.toISOString().split('T')[0]));
      }
    },
    [dispatch],
  );

  const handleContinue = useCallback(() => {
    if (!paymentType) return;

    // Set notes
    dispatch(setNotes(notes));

    // For credit sales, set due date
    if (paymentType === 'credit' || paymentType === 'partial') {
      dispatch(setDueDate(selectedDate.toISOString().split('T')[0]));
    }

    // @ts-ignore
    navigation.navigate('Confirmation');
  }, [paymentType, notes, selectedDate, dispatch, navigation]);

  const isFormValid = () => {
    if (!paymentType) return false;
    if (paymentType === 'partial') {
      const amount = Number(partialAmount);
      return amount > 0 && amount < totals.grandTotal;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{customerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValueLarge}>
              PKR {totals.grandTotal.toLocaleString()}
            </Text>
          </View>
          {customer && customer.outstanding_balance > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Previous Outstanding</Text>
              <Text style={[styles.summaryValue, styles.outstandingText]}>
                PKR {customer.outstanding_balance.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Type Selection */}
        <Text style={styles.question}>Payment terms?</Text>

        <TouchableOpacity
          style={[
            styles.selectionCard,
            paymentType === 'full' && styles.selectionCardActive,
          ]}
          onPress={() => handlePaymentTypeSelect('full')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionIcon}>
            <MoneyIcon
              size={24}
              color={
                paymentType === 'full'
                  ? theme.colors.primary
                  : theme.colors.text.secondary
              }
              weight={paymentType === 'full' ? 'fill' : 'regular'}
            />
          </View>
          <View style={styles.selectionContent}>
            <Text
              style={[
                styles.selectionLabel,
                paymentType === 'full' && styles.selectionLabelActive,
              ]}
            >
              Full Sale
            </Text>
            <Text style={styles.selectionDescription}>
              Customer paid immediately
            </Text>
          </View>
          {paymentType === 'full' && (
            <CheckCircleIcon
              size={24}
              color={theme.colors.primary}
              weight="fill"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectionCard,
            paymentType === 'credit' && styles.selectionCardActive,
          ]}
          onPress={() => handlePaymentTypeSelect('credit')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionIcon}>
            <CalendarIcon
              size={24}
              color={
                paymentType === 'credit'
                  ? theme.colors.primary
                  : theme.colors.text.secondary
              }
              weight={paymentType === 'credit' ? 'fill' : 'regular'}
            />
          </View>
          <View style={styles.selectionContent}>
            <Text
              style={[
                styles.selectionLabel,
                paymentType === 'credit' && styles.selectionLabelActive,
              ]}
            >
              Credit Sale
            </Text>
            <Text style={styles.selectionDescription}>
              Customer will pay later
            </Text>
          </View>
          {paymentType === 'credit' && (
            <CheckCircleIcon
              size={24}
              color={theme.colors.primary}
              weight="fill"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectionCard,
            paymentType === 'partial' && styles.selectionCardActive,
          ]}
          onPress={() => handlePaymentTypeSelect('partial')}
          activeOpacity={0.7}
        >
          <View style={styles.selectionIcon}>
            <CreditCardIcon
              size={24}
              color={
                paymentType === 'partial'
                  ? theme.colors.primary
                  : theme.colors.text.secondary
              }
              weight={paymentType === 'partial' ? 'fill' : 'regular'}
            />
          </View>
          <View style={styles.selectionContent}>
            <Text
              style={[
                styles.selectionLabel,
                paymentType === 'partial' && styles.selectionLabelActive,
              ]}
            >
              Partial Payment
            </Text>
            <Text style={styles.selectionDescription}>
              Customer paid some amount now
            </Text>
          </View>
          {paymentType === 'partial' && (
            <CheckCircleIcon
              size={24}
              color={theme.colors.primary}
              weight="fill"
            />
          )}
        </TouchableOpacity>

        {/* Partial Payment Amount Input */}
        {paymentType === 'partial' && (
          <View style={styles.partialAmountContainer}>
            <Text style={styles.inputLabel}>Amount Paid Now</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>PKR</Text>
              <TextInput
                style={styles.input}
                value={partialAmount}
                onChangeText={handlePartialAmountChange}
                placeholder="0"
                placeholderTextColor={theme.colors.text.disabled}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.inputHint}>
              Remaining: PKR{' '}
              {(
                totals.grandTotal - Number(partialAmount || 0)
              ).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Due Date Selection - For Credit and Partial */}
        {(paymentType === 'credit' || paymentType === 'partial') && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <CalendarIcon size={20} color={theme.colors.primary} />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes Input */}
        <View style={styles.notesContainer}>
          <Text style={styles.inputLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setLocalNotes}
            placeholder="Add any additional notes..."
            placeholderTextColor={theme.colors.text.disabled}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="Continue to Confirmation"
          onPress={handleContinue}
          variant="primary"
          size="large"
          disabled={!isFormValid()}
        />
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
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
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    summaryValueLarge: {
      fontSize: 24,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    outstandingText: {
      color: theme.colors.error,
    },
    question: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    selectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      ...theme.shadows.sm,
    },
    selectionCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    selectionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    selectionContent: {
      flex: 1,
    },
    selectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    selectionLabelActive: {
      color: theme.colors.primary,
    },
    selectionDescription: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    partialAmountContainer: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      ...theme.shadows.sm,
    },
    currencyPrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.md,
    },
    inputHint: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    dueDateContainer: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    notesContainer: {
      marginTop: theme.spacing.lg,
    },
    notesInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.text.primary,
      minHeight: 80,
      ...theme.shadows.sm,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default CreditTermsScreen;
