import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { CheckCircleIcon, MoneyIcon } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';

interface AllocationInfo {
  invoiceNumber: string;
  amount: number;
  status: 'settled' | 'partial';
}

interface PaymentReceiptProps {
  amount: number;
  dateTime: string;
  receiptNumber: string;
  partyName: string;
  partyType: 'customer' | 'supplier';
  paymentMode: string;
  allocations?: AllocationInfo[];
  newBalance: number;
  showQR?: boolean;
}

const PaymentReceiptComponent: React.FC<PaymentReceiptProps> = ({
  amount,
  dateTime,
  receiptNumber,
  partyName,
  partyType,
  paymentMode,
  allocations = [],
  newBalance,
  showQR = false,
}) => {
  const theme = useTheme();

  const formatDateTime = (dt: string) => {
    const date = new Date(dt);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
    };
  };

  const { date, time } = formatDateTime(dateTime);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          overflow: 'hidden',
          ...theme.shadows.md,
        },
        topBorder: {
          height: 6,
          backgroundColor: theme.colors.primary,
        },
        content: {
          padding: theme.spacing.lg,
        },
        header: {
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        },
        receiptLabel: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: theme.spacing.xs,
        },
        amount: {
          ...theme.typography.h1,
          fontSize: 36,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
        },
        dateTime: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.xs,
        },
        divider: {
          borderStyle: 'dashed',
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginVertical: theme.spacing.md,
        },
        detailsSection: {
          gap: theme.spacing.sm,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        detailLabel: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
        },
        detailValue: {
          ...theme.typography.body,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        detailValueWithIcon: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        allocationsSection: {
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
        },
        allocationsTitle: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.sm,
        },
        allocationRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: theme.spacing.xs,
        },
        allocationInvoice: {
          ...theme.typography.body,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        allocationStatus: {
          ...theme.typography.caption,
          color: theme.colors.success,
          textTransform: 'uppercase',
        },
        allocationAmount: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
        },
        balanceCard: {
          backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}10`,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginTop: theme.spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.primary,
          borderStyle: 'dashed',
        },
        balanceLabelContainer: {
          flex: 1,
        },
        balanceLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        balanceSublabel: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
        },
        balanceAmount: {
          ...theme.typography.h2,
          fontWeight: 'bold',
          color: theme.colors.primary,
        },
        qrContainer: {
          alignItems: 'center',
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
        },
        qrPlaceholder: {
          width: 80,
          height: 80,
          backgroundColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        downloadText: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          marginTop: theme.spacing.sm,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.receiptLabel}>Payment Receipt</Text>
          <Text style={styles.amount}>Rs. {amount.toLocaleString()}</Text>
          <Text style={styles.dateTime}>{date} • {time}</Text>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receipt #</Text>
            <Text style={styles.detailValue}>{receiptNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{partyType === 'customer' ? 'Customer' : 'Supplier'}</Text>
            <Text style={styles.detailValue}>{partyName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Mode</Text>
            <View style={styles.detailValueWithIcon}>
              <MoneyIcon size={18} color={theme.colors.text.primary} weight="fill" />
              <Text style={styles.detailValue}>{paymentMode}</Text>
            </View>
          </View>
        </View>

        {/* Allocations */}
        {allocations.length > 0 && (
          <View style={styles.allocationsSection}>
            <Text style={styles.allocationsTitle}>Allocated To</Text>
            {allocations.map((allocation, index) => (
              <View key={index} style={styles.allocationRow}>
                <View>
                  <Text style={styles.allocationInvoice}>{allocation.invoiceNumber}</Text>
                  <Text style={styles.allocationStatus}>
                    {allocation.status === 'settled' ? 'SETTLED FULL' : 'PARTIAL'}
                  </Text>
                </View>
                <Text style={styles.allocationAmount}>Rs. {allocation.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* New Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLabelContainer}>
            <Text style={styles.balanceLabel}>New Balance</Text>
            <Text style={styles.balanceSublabel}>Naya Baqiya</Text>
          </View>
          <Text style={styles.balanceAmount}>Rs. {newBalance.toLocaleString()}</Text>
        </View>

        {/* QR Code */}
        {showQR && (
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <MoneyIcon size={32} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.downloadText}>Download PDF Receipt</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const PaymentReceipt = memo(PaymentReceiptComponent);
