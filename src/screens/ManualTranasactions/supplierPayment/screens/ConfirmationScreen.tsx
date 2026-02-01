// flows/supplierPayment/screens/ConfirmationScreen.tsx
// Confirmation screen showing payment success and next actions
import React, { useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  BackHandler,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircleIcon,
  ShareNetworkIcon,
  FileTextIcon,
  BellIcon,
  PlusCircleIcon,
  HouseIcon,
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
  selectPayablePaymentResponse,
  resetPayablesFlow,
} from '../../../../store/slices/supplierPayment';
import ActionButton from '../../../../components/common/ActionButton';

const ConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Select all data from Redux
  const supplier = useAppSelector(selectPayableSupplier);
  const amount = useAppSelector(selectPayableAmount);
  const remainingAfterPayment = useAppSelector(selectRemainingAfterPayment);
  const paymentMethod = useAppSelector(selectPayablePaymentMethod);
  const bankAccountId = useAppSelector(selectPayableBankAccountId);
  const paymentResponse = useAppSelector(selectPayablePaymentResponse);

  // Get bank account from state
  const bankAccounts = useAppSelector(
    state => state.bankAccounts?.accounts || [],
  );
  const selectedBankAccount = useMemo(() => {
    if (!bankAccountId) return null;
    return bankAccounts.find(acc => acc.id === bankAccountId);
  }, [bankAccountId, bankAccounts]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Prevent going back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleDone();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // Format payment method display
  const paymentMethodDisplay = useMemo(() => {
    if (!paymentMethod) return 'Cash';

    switch (paymentMethod) {
      case 'Cash':
        return 'Cash';
      case 'Bank':
        if (selectedBankAccount) {
          return `${selectedBankAccount.bankName} (****${
            selectedBankAccount.accountNumber?.slice(-4) || ''
          })`;
        }
        return 'Bank Transfer';
      default:
        return paymentMethod;
    }
  }, [paymentMethod, selectedBankAccount]);

  // Generate payment reference number
  const paymentNumber = useMemo(() => {
    if (paymentResponse?.payment?.paymentNumber) {
      return `PAY-${paymentResponse?.payment?.paymentNumber}`;
    }
    return `PAY-${Date.now().toString().slice(-6)}`;
  }, [paymentResponse]);

  // Is advance payment?
  const isAdvance = remainingAfterPayment < 0;

  // Handle done - reset flow and go home
  const handleDone = useCallback(() => {
    dispatch(resetPayablesFlow());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      }),
    );
  }, [dispatch, navigation]);

  // Handle add another payment
  const handleAddAnother = useCallback(() => {
    dispatch(resetPayablesFlow());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'SupplierPaymentFlow' as never }],
      }),
    );
  }, [dispatch, navigation]);

  // Handle share receipt
  const handleShareReceipt = useCallback(async () => {
    try {
      const message =
        `Payment Receipt\n\n` +
        `Payment #: ${paymentNumber}\n` +
        `Supplier: ${supplier?.name}\n` +
        `Amount: PKR ${amount.toLocaleString()}\n` +
        `Payment Method: ${paymentMethodDisplay}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Remaining Balance: PKR ${Math.abs(
          remainingAfterPayment,
        ).toLocaleString()}${isAdvance ? ' (Advance)' : ''}\n\n` +
        `Thank you for your business!`;

      await Share.share({
        message,
        title: 'Payment Receipt',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  }, [
    paymentNumber,
    supplier,
    amount,
    paymentMethodDisplay,
    remainingAfterPayment,
    isAdvance,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <CheckCircleIcon
              size={64}
              color={theme.colors.success}
              weight="fill"
            />
          </View>
          <Text style={styles.successTitle}>Payment Recorded!</Text>
          <Text style={styles.successSubtitle}>
            Payment has been sent successfully
          </Text>
        </View>

        {/* Payment Number */}
        <View style={styles.paymentNumberCard}>
          <Text style={styles.paymentLabel}>Payment #</Text>
          <Text style={styles.paymentValue}>{paymentNumber}</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supplier</Text>
            <Text style={styles.summaryValue}>
              {supplier?.name || 'Unknown'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>{paymentMethodDisplay}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isAdvance ? 'Advance Amount' : 'Remaining Balance'}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                styles.summaryValueBold,
                {
                  color:
                    remainingAfterPayment === 0
                      ? theme.colors.success
                      : isAdvance
                      ? theme.colors.warning
                      : theme.colors.error,
                },
              ]}
            >
              PKR {Math.abs(remainingAfterPayment).toLocaleString()}
            </Text>
          </View>

          {remainingAfterPayment === 0 && (
            <View style={styles.statusBadge}>
              <CheckCircleIcon size={16} color={theme.colors.success} />
              <Text style={styles.statusText}>Fully Paid</Text>
            </View>
          )}

          {isAdvance && (
            <View style={[styles.statusBadge, styles.advanceBadge]}>
              <Text style={[styles.statusText, styles.advanceText]}>
                Advance Payment: PKR{' '}
                {Math.abs(remainingAfterPayment).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>What's next?</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleShareReceipt}
        >
          <ShareNetworkIcon
            size={24}
            color={theme.colors.primary}
            weight="fill"
          />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Share Payment Receipt</Text>
            <Text style={styles.actionDescription}>
              Send to {supplier?.name}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <FileTextIcon size={24} color="#5856D6" weight="fill" />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Payment Details</Text>
            <Text style={styles.actionDescription}>
              See complete payment info
            </Text>
          </View>
        </TouchableOpacity>

        {remainingAfterPayment > 0 && (
          <TouchableOpacity style={styles.actionCard}>
            <BellIcon size={24} color="#FF9500" weight="fill" />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Set Payment Reminder</Text>
              <Text style={styles.actionDescription}>
                For remaining PKR {remainingAfterPayment.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <ActionButton
          title="Done"
          onPress={handleDone}
          variant="primary"
          icon={<HouseIcon size={20} color="#FFFFFF" weight="bold" />}
        />

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAddAnother}
          >
            <PlusCircleIcon size={18} color={theme.colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Pay Another Supplier</Text>
          </TouchableOpacity>
        </View>
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
    successHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    successIconContainer: {
      marginBottom: theme.spacing.md,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    successSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    paymentNumberCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    paymentLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    paymentValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
      textAlign: 'right',
      maxWidth: '60%',
    },
    summaryValueLarge: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    summaryValueBold: {
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.colors.success}15`,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    advanceBadge: {
      backgroundColor: `${theme.colors.warning}15`,
    },
    statusText: {
      fontSize: 13,
      color: theme.colors.success,
      fontWeight: '600',
    },
    advanceText: {
      color: theme.colors.warning,
    },
    actionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    actionContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    actionDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    bottomActions: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    secondaryActions: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    secondaryButtonText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
  });

export default ConfirmationScreen;
