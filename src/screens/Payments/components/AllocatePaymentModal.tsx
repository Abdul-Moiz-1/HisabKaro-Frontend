import React, { memo, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { XIcon, CheckCircleIcon } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';
import { Button } from '../../../components/common';
import { BillAllocationItem } from './BillAllocationItem';
import { InvoiceAllocation } from '../schemas/paymentSchemas';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PendingInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date?: string;
  is_overdue?: boolean;
}

interface AllocatePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (allocations: InvoiceAllocation[]) => void;
  totalAmount: number;
  pendingInvoices: PendingInvoice[];
  initialAllocations?: InvoiceAllocation[];
}

const AllocatePaymentModalComponent: React.FC<AllocatePaymentModalProps> = ({
  visible,
  onClose,
  onApply,
  totalAmount,
  pendingInvoices,
  initialAllocations = [],
}) => {
  const theme = useTheme();
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map());
  const slideAnim = useMemo(() => new Animated.Value(SCREEN_HEIGHT), []);

  useEffect(() => {
    if (visible) {
      // Initialize allocations
      const initialMap = new Map<string, number>();
      initialAllocations.forEach((alloc) => {
        initialMap.set(alloc.invoice_id, alloc.allocated_amount);
      });
      setAllocations(initialMap);

      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialAllocations, slideAnim]);

  const totalAllocated = useMemo(() => {
    let total = 0;
    allocations.forEach((amount) => {
      total += amount;
    });
    return total;
  }, [allocations]);

  const remainingAmount = totalAmount - totalAllocated;

  const handleToggleInvoice = (invoiceId: string) => {
    const invoice = pendingInvoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const newAllocations = new Map(allocations);
    
    if (newAllocations.has(invoiceId)) {
      // Deselect - remove allocation
      newAllocations.delete(invoiceId);
    } else {
      // Select - allocate remaining amount up to invoice amount
      const allocatableAmount = Math.min(remainingAmount, invoice.amount);
      if (allocatableAmount > 0) {
        newAllocations.set(invoiceId, allocatableAmount);
      }
    }

    setAllocations(newAllocations);
  };

  const handleApply = () => {
    const result: InvoiceAllocation[] = [];
    allocations.forEach((amount, invoiceId) => {
      const invoice = pendingInvoices.find((inv) => inv.id === invoiceId);
      if (invoice && amount > 0) {
        result.push({
          invoice_id: invoiceId,
          invoice_number: invoice.invoice_number,
          invoice_amount: invoice.amount,
          allocated_amount: amount,
          is_full_settlement: amount >= invoice.amount,
        });
      }
    });
    onApply(result);
    onClose();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        container: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.borderRadius.xxl,
          borderTopRightRadius: theme.borderRadius.xxl,
          maxHeight: SCREEN_HEIGHT * 0.85,
          paddingBottom: 34,
        },
        handle: {
          width: 40,
          height: 4,
          backgroundColor: theme.colors.border,
          borderRadius: 2,
          alignSelf: 'center',
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        },
        header: {
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        title: {
          ...theme.typography.h3,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        subtitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.xs,
        },
        closeButton: {
          position: 'absolute',
          right: theme.spacing.lg,
          top: 0,
          padding: theme.spacing.xs,
        },
        summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.md,
        },
        summaryCard: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borderRadius.lg,
          marginHorizontal: theme.spacing.xs,
        },
        summaryCardLeft: {
          backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}15`,
        },
        summaryCardRight: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        summaryLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs,
        },
        summaryAmount: {
          ...theme.typography.h2,
          fontWeight: 'bold',
        },
        summaryAmountPrimary: {
          color: theme.colors.primary,
        },
        summaryAmountSecondary: {
          color: theme.colors.text.primary,
        },
        content: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
        },
        invoiceList: {
          maxHeight: SCREEN_HEIGHT * 0.4,
        },
        footer: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
        },
        applyButton: {
          marginTop: theme.spacing.sm,
        },
      }),
    [theme]
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.handle} />
            
            <View style={styles.header}>
              <Text style={styles.title}>Allocate Payment</Text>
              <Text style={styles.subtitle}>Payment Distribution / Payment ki Taqseem</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <XIcon size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryCardLeft]}>
                <Text style={styles.summaryLabel}>Total Received</Text>
                <Text style={[styles.summaryAmount, styles.summaryAmountPrimary]}>
                  Rs. {totalAmount.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardRight]}>
                <Text style={styles.summaryLabel}>Remaining (Baqi)</Text>
                <Text style={[styles.summaryAmount, styles.summaryAmountSecondary]}>
                  Rs. {remainingAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.sectionTitle}>Pending Invoices</Text>
              <ScrollView style={styles.invoiceList} showsVerticalScrollIndicator={false}>
                {pendingInvoices.map((invoice) => (
                  <BillAllocationItem
                    key={invoice.id}
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoice_number}
                    invoiceAmount={invoice.amount}
                    allocatedAmount={allocations.get(invoice.id) || 0}
                    dueDate={invoice.due_date}
                    isOverdue={invoice.is_overdue}
                    isSelected={allocations.has(invoice.id)}
                    onToggleSelect={handleToggleInvoice}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.footer}>
              <Button
                title="Apply Allocation"
                onPress={handleApply}
                variant="primary"
                size="large"
                icon={<CheckCircleIcon size={20} color="#FFFFFF" weight="fill" />}
                style={styles.applyButton}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export const AllocatePaymentModal = memo(AllocatePaymentModalComponent);
