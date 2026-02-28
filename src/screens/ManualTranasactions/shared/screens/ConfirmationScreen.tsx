import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CheckCircleIcon,
  ShareNetworkIcon,
  CameraIcon,
  FileTextIcon,
  BellIcon,
  NoteIcon,
  ArrowClockwiseIcon,
  ArrowUUpLeftIcon,
  CaretRightIcon,
  PrinterIcon,
  DownloadIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Button } from '../../../../components/common';
import {
  selectSelectedSupplier,
  selectPurchaseItems,
  selectPurchaseTotals,
  selectPaymentDetails,
  selectCreatedInvoice,
  resetPurchaseFlow,
} from '../../../../store/slices/purchasesSlice';
import { ROUTES } from '../../../../constants/routes';

const ConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  // Get data from route params (passed from previous screen) or Redux
  // @ts-ignore
  const routeParams = route.params?.flowData || route.params || {};

  const supplier = useAppSelector(selectSelectedSupplier) || routeParams.supplier;
  const items = useAppSelector(selectPurchaseItems);
  const totals = useAppSelector(selectPurchaseTotals);
  const paymentDetails = useAppSelector(selectPaymentDetails);
  const createdInvoice = useAppSelector(selectCreatedInvoice);

  // Use route params if available, otherwise use Redux
  const totalAmount = routeParams.totalAmount || routeParams.grandTotal || routeParams.directTotal || totals.grandTotal;
  const paymentStatus = routeParams.paymentStatus || paymentDetails.status;
  const paymentMethod = routeParams.paymentMethod || paymentDetails.method;
  const paidAmount = routeParams.paidAmount || paymentDetails.paidAmount;
  const remainingAmount = routeParams.remainingAmount || paymentDetails.remainingAmount;
  const dueDate = routeParams.dueDate || paymentDetails.dueDate;
  const bill = routeParams.bill || items;

  const invoiceNumber = createdInvoice?.invoice_number || `PUR-${Date.now().toString().slice(-6)}`;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleDone = useCallback(() => {
    dispatch(resetPurchaseFlow());
    // @ts-ignore
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.HOME }],
    });
  }, [dispatch, navigation]);

  const handleUndo = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Undo Purchase',
      text2: 'This feature is coming soon',
    });
  }, []);

  const handleRepeatPurchase = useCallback(() => {
    dispatch(resetPurchaseFlow());
    // @ts-ignore - Navigate back to start of purchase flow
    navigation.navigate('SupplierSelection');
  }, [dispatch, navigation]);

  const handleShareBill = useCallback(async () => {
    try {
      const message = `
Purchase Invoice: ${invoiceNumber}
Supplier: ${supplier?.name || 'N/A'}
Total Amount: PKR ${totalAmount?.toLocaleString() || 0}
Status: ${getStatusText()}
Date: ${new Date().toLocaleDateString('en-PK')}
      `.trim();

      await Share.share({
        message,
        title: `Purchase Invoice - ${invoiceNumber}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share invoice',
      });
    }
  }, [invoiceNumber, supplier, totalAmount]);

  const handleAttachPhoto = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Attach Photo',
      text2: 'Camera feature coming soon',
    });
  }, []);

  const handleViewDetails = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'View Details',
      text2: 'Bill details feature coming soon',
    });
  }, []);

  const handleSetReminder = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Set Reminder',
      text2: 'Reminder feature coming soon',
    });
  }, []);

  const handleAddNote = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Add Note',
      text2: 'Notes feature coming soon',
    });
  }, []);

  const handlePrint = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Print Invoice',
      text2: 'Print feature coming soon',
    });
  }, []);

  const handleDownload = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Download PDF',
      text2: 'Download feature coming soon',
    });
  }, []);

  const getStatusColor = () => {
    switch (paymentStatus) {
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
    switch (paymentStatus) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partially Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-PK', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <CheckCircleIcon size={64} color={theme.colors.success} weight="fill" />
          </View>
          <Text style={styles.successTitle}>Purchase Recorded!</Text>
          <Text style={styles.successSubtitle}>Bill created successfully</Text>
        </View>

        {/* Invoice Number */}
        <View style={styles.invoiceCard}>
          <Text style={styles.invoiceLabel}>Invoice #</Text>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Supplier</Text>
            <Text style={styles.summaryValue}>{supplier?.name || 'N/A'}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
              PKR {totalAmount?.toLocaleString() || 0}
            </Text>
          </View>

          {bill && bill.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{bill.length} products</Text>
            </View>
          )}

          {paymentStatus === 'partial' && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paid Now</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  PKR {paidAmount?.toLocaleString() || 0}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                  PKR {remainingAmount?.toLocaleString() || 0}
                </Text>
              </View>
            </>
          )}

          {paymentMethod && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
              </Text>
            </View>
          )}

          {dueDate && paymentStatus !== 'paid' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Due Date</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                {formatDate(dueDate)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formatDate(new Date().toISOString())}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}
            >
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handlePrint}>
            <PrinterIcon size={22} color={theme.colors.text.primary} />
            <Text style={styles.quickActionText}>Print</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleDownload}>
            <DownloadIcon size={22} color={theme.colors.text.primary} />
            <Text style={styles.quickActionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleShareBill}>
            <ShareNetworkIcon size={22} color={theme.colors.text.primary} />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <Text style={styles.actionsTitle}>What's next?</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleShareBill}>
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.info}15` }]}>
            <ShareNetworkIcon size={22} color={theme.colors.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Share Bill</Text>
            <Text style={styles.actionDescription}>Send to supplier or save</Text>
          </View>
          <CaretRightIcon size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleAttachPhoto}>
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.secondary}15` }]}>
            <CameraIcon size={22} color={theme.colors.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Attach Bill Photo</Text>
            <Text style={styles.actionDescription}>Upload supplier's physical bill</Text>
          </View>
          <CaretRightIcon size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleViewDetails}>
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.success}15` }]}>
            <FileTextIcon size={22} color={theme.colors.success} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>View Bill Details</Text>
            <Text style={styles.actionDescription}>See complete bill</Text>
          </View>
          <CaretRightIcon size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>

        {paymentStatus !== 'paid' && (
          <TouchableOpacity style={styles.actionCard} onPress={handleSetReminder}>
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
              <BellIcon size={22} color={theme.colors.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Set Payment Reminder</Text>
              <Text style={styles.actionDescription}>Remind before due date</Text>
            </View>
            <CaretRightIcon size={20} color={theme.colors.text.disabled} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionCard} onPress={handleAddNote}>
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.divider }]}>
            <NoteIcon size={22} color={theme.colors.text.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Add Note</Text>
            <Text style={styles.actionDescription}>Optional memo</Text>
          </View>
          <CaretRightIcon size={20} color={theme.colors.text.disabled} />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button title="Done" onPress={handleDone} variant="primary" size="large" />

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleUndo}>
            <ArrowUUpLeftIcon size={18} color={theme.colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRepeatPurchase}>
            <ArrowClockwiseIcon size={18} color={theme.colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Repeat Purchase</Text>
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
      marginBottom: theme.spacing.lg,
    },
    successIconContainer: {
      marginBottom: theme.spacing.sm,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.sm,
    },
    successSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    invoiceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    invoiceLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    invoiceNumber: {
      fontSize: 22,
      fontWeight: 'bold',
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
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    quickActionButton: {
      alignItems: 'center',
      gap: 6,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
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
    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    actionLabel: {
      fontSize: 15,
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
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
    },
    secondaryButtonText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
  });

export default ConfirmationScreen;
