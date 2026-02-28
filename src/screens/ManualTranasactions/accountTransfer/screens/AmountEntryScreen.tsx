// flows/accountTransfer/screens/AmountEntryScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';


import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountInputField, DateField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

const AmountEntryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { sourceAccount } = route.params?.flowData || {};
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date());

  const handleContinue = () => {
    navigateToScreen('DestinationAccountSelection', { amount, transferDate: date.toISOString() });
  };

  const quickAmounts = [
    { label: '10k', value: 10000 },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '100k', value: 100000 },
    ...(sourceAccount?.balance
      ? [
        {
          label: `All ${sourceAccount.balance.toLocaleString()}`,
          value: sourceAccount.balance,
        },
      ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Source Account Display */}
        <View style={styles.sourceCard}>
          <View style={styles.sourceHeader}>
            <Icon name="arrow-up-circle" size={20} color="#FF3B30" />
            <Text style={styles.sourceLabel}>Transferring from:</Text>
          </View>
          <View style={styles.sourceInfo}>
            <View
              style={[
                styles.sourceIcon,
                { backgroundColor: sourceAccount?.color + '20' },
              ]}
            >
              <Icon
                name={sourceAccount?.icon as any}
                size={20}
                color={sourceAccount?.color}
              />
            </View>
            <View style={styles.sourceDetails}>
              <Text style={styles.sourceName}>{sourceAccount?.name}</Text>
              {sourceAccount?.details && (
                <Text style={styles.sourceDetailsText}>
                  {sourceAccount.details}
                </Text>
              )}
              <Text style={styles.sourceBalance}>
                Available: PKR {sourceAccount?.balance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>How much to transfer?</Text>

        {/* Amount Input */}
        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: '',
            type: FieldType.AMOUNT,
          }}
          value={amount.toString()}
          onChange={(value: string) => setAmount(Number(value))}
          quickAmounts={quickAmounts}
          onBlur={() => { }}
        />

        {/* Warning if exceeds balance */}
        {amount > sourceAccount?.balance && (
          <View style={styles.warningCard}>
            <Icon name="warning" size={20} color="#FF3B30" />
            <Text style={styles.warningText}>
              Amount exceeds available balance in {sourceAccount?.name}
            </Text>
          </View>
        )}

        {/* Remaining Balance Preview */}
        {amount > 0 && amount <= sourceAccount?.balance && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>After Transfer</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{sourceAccount?.name}</Text>
              <View style={styles.previewChange}>
                <Text style={styles.previewBefore}>
                  {sourceAccount?.balance.toLocaleString()}
                </Text>
                <Icon name="arrow-forward" size={16} color="#8E8E93" />
                <Text style={styles.previewAfter}>
                  {(sourceAccount?.balance - amount).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Date Section */}
        <Text style={styles.sectionTitle}>Transfer Date</Text>
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
            id: 'transferDate',
            name: 'transferDate',
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
          title="Continue →"
          onPress={handleContinue}
          disabled={amount === 0 || amount > sourceAccount?.balance}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  sourceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sourceHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  sourceLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  sourceInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sourceDetailsText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  sourceBalance: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  warningCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FF3B30' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: '#FF3B30',
    fontWeight: '600' as const,
    flex: 1,
  },
  previewCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  previewTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
  },
  previewRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  previewLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  previewChange: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.sm,
  },
  previewBefore: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through' as const,
  },
  previewAfter: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
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
    ...theme.typography.caption,
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
