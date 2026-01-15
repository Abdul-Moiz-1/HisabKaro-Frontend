import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Share,
} from 'react-native';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  TagIcon,
  PrinterIcon,
  ShareNetworkIcon,
  PaperPlaneTiltIcon,
  CircleNotchIcon,
  CheckIcon,
  CalendarIcon,
  CreditCardIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useTheme, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Container, HeaderNavigation, Button } from '../../../../components/common';
import {
  selectSelectedCustomer,
  selectIsWalkInSale,
  selectSaleItems,
  selectSaleTotals,
  selectSalePaymentDetails,
  selectCreatedSalesInvoice,
  selectSalesLoading,
  createSalesInvoice,
  resetSalesFlow,
} from '../../../../store/slices/salesSlice';
import { ROUTES } from '../../../../constants/routes';

type ProcessingStep = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete';
};

const ConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Get data from Redux
  const customer = useAppSelector(selectSelectedCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);
  const items = useAppSelector(selectSaleItems);
  const totals = useAppSelector(selectSaleTotals);
  const paymentDetails = useAppSelector(selectSalePaymentDetails);
  const createdInvoice = useAppSelector(selectCreatedSalesInvoice);
  const isLoading = useAppSelector(selectSalesLoading);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: '1', label: 'Creating Invoice', status: 'pending' },
    { id: '2', label: 'Updating Customer Balance', status: 'pending' },
    { id: '3', label: 'Updating Inventory', status: 'pending' },
  ]);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isProcessing, rotateAnim]);

  useEffect(() => {
    if (processingComplete) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [processingComplete, scaleAnim]);

  const customerName = isWalkIn ? 'Walk-in Customer' : customer?.name || 'N/A';
  const invoiceNumber = createdInvoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);

    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      // @ts-ignore
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index === i ? 'complete' : index < i ? 'complete' : 'pending',
        }))
      );
    }

    // Create the invoice via API
    const result = await dispatch(createSalesInvoice());
    
    if (createSalesInvoice.fulfilled.match(result)) {
      setIsProcessing(false);
      setProcessingComplete(true);
      
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 500);
    } else {
      setIsProcessing(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.payload as string || 'Failed to create invoice',
      });
    }
  }, [dispatch, processingSteps.length]);

  const handleDone = useCallback(() => {
    setShowSuccessModal(false);
    dispatch(resetSalesFlow());
    // @ts-ignore
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.HOME }],
    });
  }, [dispatch, navigation]);

  const handlePrint = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Print Invoice',
      text2: 'Print feature coming soon',
    });
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const message = `
Invoice: ${invoiceNumber}
Customer: ${customerName}
Total: PKR ${totals.grandTotal.toLocaleString()}
Status: ${paymentDetails.status === 'paid' ? 'Paid' : paymentDetails.status === 'partial' ? 'Partial' : 'Pending'}
Date: ${new Date().toLocaleDateString('en-PK')}

Thank you for your business!
      `.trim();

      await Share.share({
        message,
        title: `Invoice - ${invoiceNumber}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share invoice',
      });
    }
  }, [invoiceNumber, customerName, totals.grandTotal, paymentDetails.status]);

  const handleSendWhatsApp = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Send via WhatsApp',
      text2: 'WhatsApp integration coming soon',
    });
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        content: {
          flex: 1,
          padding: theme.spacing.md,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          ...theme.shadows.sm,
        },
        cardHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        cardTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginLeft: theme.spacing.sm,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        },
        detailLabel: {
          fontSize: 14,
          color: theme.colors.text.secondary,
        },
        detailValue: {
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        warningRow: {
          backgroundColor: `${theme.colors.error}08`,
        },
        warningLabel: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        itemRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingVertical: theme.spacing.sm,
        },
        itemName: {
          fontSize: 14,
          color: theme.colors.text.primary,
          flex: 1,
        },
        itemQuantity: {
          fontSize: 12,
          color: theme.colors.text.secondary,
        },
        itemPrice: {
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text.primary,
          textAlign: 'right',
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.divider,
          marginVertical: theme.spacing.sm,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: theme.spacing.md,
        },
        totalLabel: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        totalValue: {
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.colors.primary,
        },
        statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: theme.borderRadius.md,
        },
        statusText: {
          fontSize: 13,
          fontWeight: '600',
        },
        processingContainer: {
          alignItems: 'center',
          paddingVertical: theme.spacing.xl,
        },
        processingIcon: {
          marginBottom: theme.spacing.lg,
        },
        processingTitle: {
          fontSize: 20,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg,
        },
        stepRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
          width: '100%',
          paddingHorizontal: theme.spacing.xl,
        },
        stepIcon: {
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        stepIconComplete: {
          backgroundColor: theme.colors.success,
        },
        stepIconPending: {
          backgroundColor: theme.colors.divider,
        },
        stepLabel: {
          fontSize: 14,
          color: theme.colors.text.primary,
        },
        stepLabelComplete: {
          color: theme.colors.success,
        },
        bottomButtons: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        buttonHalf: {
          flex: 1,
        },
        // Success Modal Styles
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        },
        modalContent: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xxl,
          padding: theme.spacing.xl,
          width: '100%',
          alignItems: 'center',
          ...theme.shadows.xl,
        },
        successIcon: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${theme.colors.success}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
        },
        successTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.sm,
        },
        successAmount: {
          fontSize: 28,
          fontWeight: 'bold',
          color: theme.colors.primary,
          marginBottom: theme.spacing.sm,
        },
        successSubtitle: {
          fontSize: 14,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
        },
        actionButtonsRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        iconButton: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: `${theme.colors.primary}15`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        doneButton: {
          width: '100%',
        },
      }),
    [theme]
  );

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusColor = () => {
    switch (paymentDetails.status) {
      case 'paid':
        return theme.colors.success;
      case 'partial':
        return theme.colors.warning;
      case 'pending':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = () => {
    switch (paymentDetails.status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial Payment';
      case 'pending':
        return 'Credit';
      default:
        return 'Unknown';
    }
  };

  if (isProcessing || processingComplete) {
    return (
      <Container safeArea style={styles.container}>
        <View style={styles.content}>
          <View style={styles.processingContainer}>
            <View style={styles.processingIcon}>
              {processingComplete ? (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <View style={styles.successIcon}>
                    <CheckCircleIcon size={48} color={theme.colors.success} weight="fill" />
                  </View>
                </Animated.View>
              ) : (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <CircleNotchIcon size={48} color={theme.colors.primary} weight="bold" />
                </Animated.View>
              )}
            </View>
            
            <Text style={styles.processingTitle}>
              {processingComplete ? 'Sale Complete!' : 'Processing...'}
            </Text>

            {processingSteps.map((step) => (
              <View key={step.id} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    step.status === 'complete'
                      ? styles.stepIconComplete
                      : styles.stepIconPending,
                  ]}
                >
                  <CheckIcon size={14} color="#FFFFFF" weight="bold" />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    step.status === 'complete' && styles.stepLabelComplete,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleDone}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <CheckCircleIcon size={48} color={theme.colors.success} weight="fill" />
              </View>
              
              <Text style={styles.successTitle}>Sale Recorded!</Text>
              <Text style={styles.successAmount}>PKR {totals.grandTotal.toLocaleString()}</Text>
              <Text style={styles.successSubtitle}>
                Invoice {invoiceNumber} created for {customerName}
              </Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.iconButton} onPress={handlePrint} activeOpacity={0.7}>
                  <PrinterIcon size={24} color={theme.colors.primary} weight="regular" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare} activeOpacity={0.7}>
                  <ShareNetworkIcon size={24} color={theme.colors.primary} weight="regular" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleSendWhatsApp} activeOpacity={0.7}>
                  <PaperPlaneTiltIcon size={24} color={theme.colors.primary} weight="regular" />
                </TouchableOpacity>
              </View>

              <View style={styles.doneButton}>
                <Button title="Done" onPress={handleDone} variant="primary" size="large" />
              </View>
            </View>
          </View>
        </Modal>
      </Container>
    );
  }

  return (
    <Container safeArea style={styles.container}>
      <HeaderNavigation
        title="Review & Confirm"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Customer Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer</Text>
            <Text style={styles.detailValue}>{customerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invoice No.</Text>
            <Text style={styles.detailValue}>{invoiceNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString('en-PK')}</Text>
          </View>

          {/* Show Previous Outstanding Balance */}
          {customer && customer.outstanding_balance > 0 && (
            <View style={[styles.detailRow, styles.warningRow]}>
              <View style={styles.warningLabel}>
                <WarningCircleIcon size={16} color={theme.colors.error} weight="fill" />
                <Text style={[styles.detailLabel, { marginLeft: 6 }]}>Previous Outstanding</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.colors.error }]}>
                PKR {customer.outstanding_balance.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Show New Total Outstanding (if credit/partial sale) */}
          {paymentDetails.status !== 'paid' && (
            <View style={[styles.detailRow, { borderBottomWidth: 0, backgroundColor: `${theme.colors.error}10`, marginTop: 8, padding: 12, borderRadius: 8 }]}>
              <Text style={[styles.detailLabel, { fontWeight: '600' }]}>New Total Outstanding</Text>
              <Text style={[styles.detailValue, { fontWeight: '700', color: theme.colors.error }]}>
                PKR {((customer?.outstanding_balance || 0) + paymentDetails.remainingAmount).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TagIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Items ({items.length})</Text>
          </View>
          {items.map((item) => (
            <View key={item.product_id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} × PKR {item.unit_price.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.itemPrice}>PKR {item.total.toLocaleString()}</Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          {totals.discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Discount</Text>
              <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                - PKR {totals.discount.toLocaleString()}
              </Text>
            </View>
          )}
          
          {totals.tax > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tax</Text>
              <Text style={styles.detailValue}>PKR {totals.tax.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>PKR {totals.grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCardIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Payment</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          {paymentDetails.method && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Method</Text>
              <Text style={styles.detailValue}>
                {paymentDetails.method.charAt(0).toUpperCase() + paymentDetails.method.slice(1)}
              </Text>
            </View>
          )}
          {paymentDetails.status === 'partial' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Paid Now</Text>
                <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                  PKR {paymentDetails.paidAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Remaining</Text>
                <Text style={[styles.detailValue, { color: theme.colors.error }]}>
                  PKR {paymentDetails.remainingAmount.toLocaleString()}
                </Text>
              </View>
            </>
          )}
          {paymentDetails.dueDate && paymentDetails.status !== 'paid' && (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={16} color={theme.colors.warning} />
                <Text style={[styles.detailValue, { color: theme.colors.warning }]}>
                  {new Date(paymentDetails.dueDate).toLocaleDateString('en-PK')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <View style={styles.buttonHalf}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="large"
            icon={<XCircleIcon weight="regular" />}
          />
        </View>
        <View style={styles.buttonHalf}>
          <Button
            title="Confirm Sale"
            onPress={handleConfirm}
            variant="primary"
            size="large"
            loading={isLoading}
            icon={<CheckCircleIcon weight="fill" />}
          />
        </View>
      </View>
    </Container>
  );
};

export default ConfirmationScreen;
