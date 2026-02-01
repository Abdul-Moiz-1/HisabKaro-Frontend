// flows/supplierPayment/screens/ReviewScreen.tsx
// Review screen showing all payment details before submission
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UserIcon,
  CurrencyCircleDollarIcon,
  CreditCardIcon,
  BankIcon,
  CalendarIcon,
  NoteIcon,
  ReceiptIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import {
  selectPayableSupplier,
  selectPayableAmount,
  selectRemainingAfterPayment,
  selectPayablePaymentMethod,
  selectPayableBankAccountId,
  selectPayableInvoiceAllocations,
  selectPayablesLoading,
  selectPayablesError,
  submitPayablePayment,
  clearError,
} from '../../../../store/slices/supplierPayment';
import ActionButton from '../../../../components/common/ActionButton';

const ReviewScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Select all data from Redux
  const supplier = useAppSelector(selectPayableSupplier);
  const amount = useAppSelector(selectPayableAmount);
  const remainingAfterPayment = useAppSelector(selectRemainingAfterPayment);
  const paymentMethod = useAppSelector(selectPayablePaymentMethod);
  const bankAccountId = useAppSelector(selectPayableBankAccountId);
  const invoiceAllocations = useAppSelector(selectPayableInvoiceAllocations);
  const isLoading = useAppSelector(selectPayablesLoading);
  const error = useAppSelector(selectPayablesError);

  // Get bank account from state
  const bankAccounts = useAppSelector(
    state => state.bankAccounts?.activeAccounts || [],
  );
  const selectedBankAccount = useMemo(() => {
    if (!bankAccountId) return null;
    return bankAccounts.find(acc => acc.id === bankAccountId);
  }, [bankAccountId, bankAccounts]);

  // Get notes from state
  const notes = useAppSelector(state => state.supplierPayment.notes);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Format payment method display
  const paymentMethodDisplay = useMemo(() => {
    if (!paymentMethod) return 'Not selected';

    switch (paymentMethod) {
      case 'Cash':
        return 'Cash';
      case 'Bank':
        if (selectedBankAccount) {
          return `Bank - ${selectedBankAccount.bankName} (${
            selectedBankAccount.accountNumber?.slice(-4) || '****'
          })`;
        }
        return 'Bank Transfer';
      // case 'Cheque':
      //   return 'Cheque';
      // case 'UPI':
      //   return 'UPI';
      default:
        return paymentMethod;
    }
  }, [paymentMethod, selectedBankAccount]);

  // Calculate totals
  const totalAllocated = useMemo(() => {
    return invoiceAllocations.reduce(
      (sum, alloc) => sum + alloc.allocatedAmount,
      0,
    );
  }, [invoiceAllocations]);

  const unallocatedAmount = amount - totalAllocated;

  // Is advance payment?
  const isAdvance = remainingAfterPayment < 0;

  // Handle confirm payment
  const handleConfirmPayment = useCallback(async () => {
    try {
      dispatch(clearError());
      const result = await dispatch(submitPayablePayment()).unwrap();

      // Navigate to confirmation screen on success
      // @ts-ignore
      navigation.navigate('Confirmation');
    } catch (err: any) {
      Alert.alert(
        'Payment Failed',
        err.message || 'Failed to process payment. Please try again.',
        [{ text: 'OK' }],
      );
    }
  }, [dispatch, navigation]);

  // Handle edit - go back
  const handleEdit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Payment</Text>
          <Text style={styles.headerSubtitle}>
            Please review the details before confirming
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <WarningCircleIcon size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Supplier Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Supplier</Text>
          </View>
          <Text style={styles.cardValue}>
            {supplier?.name || 'Not selected'}
          </Text>
          {supplier?.phoneNumber && (
            <Text style={styles.cardSubvalue}>{supplier.phoneNumber}</Text>
          )}
        </View>

        {/* Amount Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CurrencyCircleDollarIcon
              size={20}
              color={theme.colors.primary}
              weight="fill"
            />
            <Text style={styles.cardTitle}>Payment Amount</Text>
          </View>
          <Text style={styles.amountValue}>PKR {amount.toLocaleString()}</Text>

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Payable Balance</Text>
            <Text style={styles.amountSubvalue}>
              PKR {(supplier?.payable_balance || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>
              {isAdvance ? 'Advance Amount' : 'Remaining After Payment'}
            </Text>
            <Text
              style={[
                styles.amountSubvalue,
                {
                  color: isAdvance
                    ? theme.colors.warning
                    : remainingAfterPayment === 0
                    ? theme.colors.success
                    : theme.colors.text.primary,
                },
              ]}
            >
              PKR {Math.abs(remainingAfterPayment).toLocaleString()}
            </Text>
          </View>

          {isAdvance && (
            <View style={styles.warningBadge}>
              <WarningCircleIcon size={16} color={theme.colors.warning} />
              <Text style={styles.warningText}>This is an advance payment</Text>
            </View>
          )}

          {remainingAfterPayment === 0 && (
            <View style={styles.successBadge}>
              <Text style={styles.successText}>
                Full Payment - Account will be cleared
              </Text>
            </View>
          )}
        </View>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {paymentMethod === 'Bank' ? (
              <BankIcon size={20} color={theme.colors.primary} weight="fill" />
            ) : (
              <CreditCardIcon
                size={20}
                color={theme.colors.primary}
                weight="fill"
              />
            )}
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>
          <Text style={styles.cardValue}>{paymentMethodDisplay}</Text>
        </View>

        {/* Invoice Allocations */}
        {invoiceAllocations.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ReceiptIcon
                size={20}
                color={theme.colors.primary}
                weight="fill"
              />
              <Text style={styles.cardTitle}>Invoice Allocations</Text>
            </View>

            {invoiceAllocations.map((alloc, index) => (
              <View key={alloc.invoiceId} style={styles.allocationRow}>
                <Text style={styles.allocationInvoice}>
                  {alloc.invoiceNumber || `Invoice #${alloc.invoiceId}`}
                </Text>
                <Text style={styles.allocationAmount}>
                  PKR {alloc.allocatedAmount.toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.allocationRow}>
              <Text style={styles.allocationTotalLabel}>Total Allocated</Text>
              <Text style={styles.allocationTotalValue}>
                PKR {totalAllocated.toLocaleString()}
              </Text>
            </View>

            {unallocatedAmount > 0 && (
              <View style={styles.allocationRow}>
                <Text style={styles.allocationLabel}>Unallocated</Text>
                <Text
                  style={[
                    styles.allocationAmount,
                    { color: theme.colors.warning },
                  ]}
                >
                  PKR {unallocatedAmount.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Date Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CalendarIcon
              size={20}
              color={theme.colors.primary}
              weight="fill"
            />
            <Text style={styles.cardTitle}>Payment Date</Text>
          </View>
          <Text style={styles.cardValue}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Notes Card */}
        {notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <NoteIcon size={20} color={theme.colors.primary} weight="fill" />
              <Text style={styles.cardTitle}>Notes</Text>
            </View>
            <Text style={styles.cardValue}>{notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <ActionButton
            title="Edit"
            onPress={handleEdit}
            variant="outline"
            style={styles.editButton}
            disabled={isLoading}
          />
          <ActionButton
            title={isLoading ? 'Processing...' : 'Confirm Payment'}
            onPress={handleConfirmPayment}
            variant="primary"
            style={styles.confirmButton}
            disabled={isLoading}
          />
        </View>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Processing payment...</Text>
          </View>
        )}
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
    header: {
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.error}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.error,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    cardSubvalue: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    amountValue: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.md,
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    amountLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    amountSubvalue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    warningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    warningText: {
      fontSize: 13,
      color: theme.colors.warning,
      fontWeight: '500',
    },
    successBadge: {
      backgroundColor: `${theme.colors.success}15`,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      alignItems: 'center',
    },
    successText: {
      fontSize: 13,
      color: theme.colors.success,
      fontWeight: '600',
    },
    allocationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    allocationInvoice: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    allocationAmount: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    allocationLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    allocationTotalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    allocationTotalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    editButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 2,
    },
    loadingOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default ReviewScreen;
