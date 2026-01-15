import React, { memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSquareIcon, SquareIcon } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';

interface BillAllocationItemProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  allocatedAmount: number;
  dueDate?: string;
  isOverdue?: boolean;
  isSelected: boolean;
  onToggleSelect: (invoiceId: string) => void;
  onAllocationChange?: (invoiceId: string, amount: number) => void;
  disabled?: boolean;
}

const BillAllocationItemComponent: React.FC<BillAllocationItemProps> = ({
  invoiceId,
  invoiceNumber,
  invoiceAmount,
  allocatedAmount,
  dueDate,
  isOverdue = false,
  isSelected,
  onToggleSelect,
  disabled = false,
}) => {
  const theme = useTheme();

  const progressPercentage = invoiceAmount > 0 ? (allocatedAmount / invoiceAmount) * 100 : 0;
  const isFullyPaid = progressPercentage >= 100;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusText = () => {
    if (isFullyPaid) return 'PAID FULL';
    if (allocatedAmount > 0) return 'PARTIAL';
    if (isOverdue) return 'Overdue';
    if (dueDate) return `Due in ${getDaysUntil(dueDate)} days`;
    return 'Pending';
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.sm,
        },
        checkboxContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        invoiceInfo: {
          marginLeft: theme.spacing.sm,
          flex: 1,
        },
        invoiceNumber: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        invoiceDate: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        amountContainer: {
          alignItems: 'flex-end',
        },
        allocatedLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        allocatedAmount: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        progressContainer: {
          marginTop: theme.spacing.sm,
        },
        progressBar: {
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.border,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: 3,
          backgroundColor: theme.colors.primary,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.xs,
        },
        statusText: {
          ...theme.typography.caption,
          fontWeight: '500',
        },
        statusPending: {
          color: theme.colors.text.tertiary,
        },
        statusOverdue: {
          color: theme.colors.error,
        },
        statusPartial: {
          color: theme.colors.warning,
        },
        statusPaid: {
          color: theme.colors.success,
        },
        percentageText: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
        },
      }),
    [theme, isSelected]
  );

  const getStatusStyle = () => {
    if (isFullyPaid) return styles.statusPaid;
    if (allocatedAmount > 0) return styles.statusPartial;
    if (isOverdue) return styles.statusOverdue;
    return styles.statusPending;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggleSelect(invoiceId)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.checkboxContainer}>
          {isSelected ? (
            <CheckSquareIcon size={24} color={theme.colors.primary} weight="fill" />
          ) : (
            <SquareIcon size={24} color={theme.colors.border} weight="regular" />
          )}
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            {dueDate && (
              <Text style={styles.invoiceDate}>{formatDate(dueDate)} • {isOverdue ? 'Overdue' : `Due in ${getDaysUntil(dueDate)} days`}</Text>
            )}
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.allocatedLabel}>Allocated</Text>
          <Text style={styles.allocatedAmount}>Rs. {allocatedAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
        </View>
        <View style={styles.footer}>
          <Text style={[styles.statusText, getStatusStyle()]}>{getStatusText()}</Text>
          <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BillAllocationItem = memo(BillAllocationItemComponent);
