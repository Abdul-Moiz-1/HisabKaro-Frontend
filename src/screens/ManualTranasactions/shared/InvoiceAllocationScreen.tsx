// shared/InvoiceAllocationScreen.tsx
// Shared Invoice Allocation/Reconciliation Screen for Receipt and Payment flows
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileTextIcon,
  CheckCircleIcon,
  LightningIcon,
  XIcon,
  WarningCircleIcon,
  ArrowRightIcon,
  CaretDownIcon,
} from 'phosphor-react-native';

import { useTheme } from '../../../store/hooks';
import ActionButton from '../../../components/common/ActionButton';
import { FlowType } from '../../../types/trasactions';
import {
  useInvoiceAllocationFlow,
  PendingInvoiceType,
} from './hooks/useFlowAdapter';

type RouteParams = {
  InvoiceAllocation: {
    flowType?: FlowType;
  };
};

const InvoiceAllocationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'InvoiceAllocation'>>();

  const { flowType = 'receipt' } = route.params || {};

  const {
    config,
    party,
    amount,
    pendingInvoices,
    allocationSummary,
    isLoading,
    fetchPendingInvoices,
    setInvoiceAllocation,
    autoAllocate,
    clearAllocations,
  } = useInvoiceAllocationFlow(flowType);

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PendingInvoiceType | null>(
    null,
  );
  const [editAmount, setEditAmount] = useState('');

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch pending invoices on mount
  useFocusEffect(
    useCallback(() => {
      if (party?.id) {
        fetchPendingInvoices(String(party.id));
      }
    }, [party?.id, fetchPendingInvoices]),
  );

  const handleAutoAllocate = useCallback(() => {
    autoAllocate();
  }, [autoAllocate]);

  const handleClearAllocations = useCallback(() => {
    clearAllocations();
  }, [clearAllocations]);

  const handleInvoicePress = useCallback((invoice: PendingInvoiceType) => {
    setEditingInvoice(invoice);
    setEditAmount(
      invoice.allocatedAmount > 0 ? invoice.allocatedAmount.toString() : '',
    );
    setShowBottomSheet(true);
  }, []);

  const handleAllocationSave = useCallback(() => {
    if (editingInvoice) {
      const allocateAmount = Math.min(
        Number(editAmount) || 0,
        editingInvoice.outstandingAmount,
        amount -
          allocationSummary.totalAllocated +
          editingInvoice.allocatedAmount,
      );
      setInvoiceAllocation({
        invoiceId: editingInvoice.id,
        amount: Math.max(0, allocateAmount),
      });
    }
    setShowBottomSheet(false);
    setEditingInvoice(null);
    setEditAmount('');
  }, [
    editingInvoice,
    editAmount,
    amount,
    allocationSummary.totalAllocated,
    setInvoiceAllocation,
  ]);

  const handleAllocateFull = useCallback(() => {
    if (editingInvoice) {
      const maxAllocatable = Math.min(
        editingInvoice.outstandingAmount,
        amount -
          allocationSummary.totalAllocated +
          editingInvoice.allocatedAmount,
      );
      setInvoiceAllocation({
        invoiceId: editingInvoice.id,
        amount: maxAllocatable,
      });
    }
    setShowBottomSheet(false);
    setEditingInvoice(null);
    setEditAmount('');
  }, [editingInvoice, amount, allocationSummary.totalAllocated, setInvoiceAllocation]);

  const handleContinue = useCallback(() => {
    // @ts-ignore
    navigation.navigate(config.nextScreen, { flowType });
  }, [navigation, config.nextScreen, flowType]);

  const handleSkipAllocation = useCallback(() => {
    clearAllocations();
    // @ts-ignore
    navigation.navigate(config.nextScreen, { flowType });
  }, [clearAllocations, navigation, config.nextScreen, flowType]);

  const renderInvoiceItem = useCallback(
    ({ item: invoice }: { item: PendingInvoiceType }) => {
      const isAllocated = invoice.allocatedAmount > 0;
      const isFullyAllocated =
        invoice.allocatedAmount >= invoice.outstandingAmount;

      return (
        <TouchableOpacity
          style={[
            styles.invoiceCard,
            isAllocated && styles.invoiceCardAllocated,
          ]}
          onPress={() => handleInvoicePress(invoice)}
          activeOpacity={0.7}
        >
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceIcon}>
              <FileTextIcon
                size={20}
                color={
                  isAllocated
                    ? theme.colors.primary
                    : theme.colors.text.secondary
                }
              />
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                {new Date(invoice.invoiceDate).toLocaleDateString()}
                {invoice.isOverdue && (
                  <Text style={styles.overdueText}> (Overdue)</Text>
                )}
              </Text>
            </View>
            {isFullyAllocated && (
              <CheckCircleIcon
                size={20}
                color={theme.colors.success}
                weight="fill"
              />
            )}
          </View>

          <View style={styles.invoiceAmounts}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Outstanding:</Text>
              <Text style={styles.amountValue}>
                PKR {invoice.outstandingAmount.toLocaleString()}
              </Text>
            </View>
            {isAllocated && (
              <View style={styles.amountRow}>
                <Text
                  style={[styles.amountLabel, { color: theme.colors.primary }]}
                >
                  Allocated:
                </Text>
                <Text
                  style={[styles.amountValue, { color: theme.colors.primary }]}
                >
                  PKR {invoice.allocatedAmount.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to allocate</Text>
            <CaretDownIcon size={14} color={theme.colors.text.disabled} />
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme, handleInvoicePress],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileTextIcon size={64} color={theme.colors.text.disabled} />
      <Text style={styles.emptyTitle}>{config.emptyStateTitle}</Text>
      <Text style={styles.emptySubtitle}>{config.emptyStateSubtitle}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{config.amountLabel}</Text>
            <Text style={styles.summaryAmount}>
              PKR {amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{config.allocatedLabel}</Text>
            <Text
              style={[styles.summaryAmount, { color: theme.colors.success }]}
            >
              PKR {allocationSummary.totalAllocated.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{config.unallocatedLabel}</Text>
            <Text
              style={[
                styles.summaryAmount,
                {
                  color:
                    allocationSummary.unallocatedAmount > 0
                      ? theme.colors.warning
                      : theme.colors.success,
                },
              ]}
            >
              PKR {allocationSummary.unallocatedAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {pendingInvoices.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.autoAllocateButton}
            onPress={handleAutoAllocate}
            activeOpacity={0.7}
          >
            <LightningIcon
              size={18}
              color={theme.colors.primary}
              weight="fill"
            />
            <Text style={styles.autoAllocateText}>
              {config.autoAllocateButtonText}
            </Text>
          </TouchableOpacity>

          {allocationSummary.totalAllocated > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAllocations}
              activeOpacity={0.7}
            >
              <XIcon size={16} color={theme.colors.error} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Invoice List */}
      <FlatList
        data={pendingInvoices}
        keyExtractor={item => item.id.toString()}
        renderItem={renderInvoiceItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Unallocated Warning */}
      {allocationSummary.unallocatedAmount > 0 &&
        pendingInvoices.length > 0 && (
          <View style={styles.warningBanner}>
            <WarningCircleIcon size={18} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              PKR {allocationSummary.unallocatedAmount.toLocaleString()}{' '}
              {config.unallocatedWarning}
            </Text>
          </View>
        )}

      {/* Footer */}
      <View style={styles.footer}>
        {pendingInvoices.length > 0 ? (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipAllocation}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{config.skipButtonText}</Text>
            </TouchableOpacity>
            <View style={styles.continueButton}>
              <ActionButton
                title={config.continueButtonText}
                onPress={handleContinue}
              />
            </View>
          </>
        ) : (
          <ActionButton
            title={config.continueButtonText}
            onPress={handleContinue}
          />
        )}
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          // onPress={() => setShowBottomSheet(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.bottomSheetHandle} />

            <Text style={styles.bottomSheetTitle}>Allocate Payment</Text>

            {editingInvoice && (
              <>
                <View style={styles.invoiceDetail}>
                  <Text style={styles.invoiceDetailLabel}>Invoice</Text>
                  <Text style={styles.invoiceDetailValue}>
                    {editingInvoice.invoiceNumber}
                  </Text>
                </View>

                <View style={styles.invoiceDetail}>
                  <Text style={styles.invoiceDetailLabel}>Outstanding</Text>
                  <Text style={styles.invoiceDetailValue}>
                    PKR {editingInvoice.outstandingAmount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.invoiceDetail}>
                  <Text style={styles.invoiceDetailLabel}>Max Allocatable</Text>
                  <Text style={styles.invoiceDetailValue}>
                    PKR{' '}
                    {Math.min(
                      editingInvoice.outstandingAmount,
                      amount -
                        allocationSummary.totalAllocated +
                        editingInvoice.allocatedAmount,
                    ).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Amount to Allocate</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencyPrefix}>PKR</Text>
                    <TextInput
                      style={styles.input}
                      value={editAmount}
                      onChangeText={setEditAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.text.disabled}
                    />
                  </View>
                </View>

                <View style={styles.bottomSheetActions}>
                  <TouchableOpacity
                    style={styles.allocateFullButton}
                    onPress={handleAllocateFull}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.allocateFullText}>Allocate Full</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAllocationSave}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                    <ArrowRightIcon size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    summaryHeader: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border,
    },
    summaryLabel: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    summaryAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    autoAllocateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    autoAllocateText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      gap: 4,
    },
    clearButtonText: {
      fontSize: 14,
      color: theme.colors.error,
    },
    listContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
      flexGrow: 1,
    },
    invoiceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    invoiceCardAllocated: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}05`,
    },
    invoiceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    invoiceIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    invoiceInfo: {
      flex: 1,
    },
    invoiceNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    invoiceDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    overdueText: {
      color: theme.colors.error,
    },
    invoiceAmounts: {
      gap: 4,
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    amountLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    amountValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    tapHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      gap: 4,
    },
    tapHintText: {
      fontSize: 11,
      color: theme.colors.text.disabled,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.warning}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.warning,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    skipButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    skipButtonText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    continueButton: {
      flex: 1,
    },
    // Bottom Sheet Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    bottomSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: theme.spacing.lg,
    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    invoiceDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    invoiceDetailLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    invoiceDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    inputContainer: {
      marginTop: theme.spacing.lg,
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
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
    },
    currencyPrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing.md,
    },
    bottomSheetActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    allocateFullButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
    },
    allocateFullText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    saveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.xs,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

export default InvoiceAllocationScreen;
